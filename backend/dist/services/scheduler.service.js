"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const availability_service_1 = require("./availability.service");
const sessione_service_1 = require("./sessione.service");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
const logger = {
    debug: (msg, ...args) => { if (process.env.LOG_LEVEL === LogLevel.DEBUG)
        console.debug(msg, ...args); },
    info: (msg, ...args) => { console.info(msg, ...args); },
    warn: (msg, ...args) => { console.warn(msg, ...args); },
    error: (msg, ...args) => { console.error(msg, ...args); }
};
const schedule = async (corso_id, giorniDisponibili, ordine) => {
    const sessioniBulk = [];
    // Caricamento dati iniziali (Pre-fetch)
    const corso = await prisma_1.prisma.corso.findUnique({
        where: { id: corso_id },
        include: { programma: true }
    });
    if (!corso || !corso.inizio || !corso.fine) {
        throw new Error("Dati corso insufficienti (date inizio/fine mancanti)");
    }
    const docentiAbilitati = await prisma_1.prisma.corso_docente.findMany({
        where: { corso_id },
        include: { docente: { include: { docente_modulo: true } } }
    });
    const corsoConAule = await prisma_1.prisma.corso.findUnique({
        where: { id: corso_id },
        select: { corso_sede: { select: { sede: { select: { aula: true } } } } }
    });
    const listaAule = corsoConAule?.corso_sede.flatMap(cs => cs.sede.aula) ?? [];
    // Pulizia sessioni esistenti in stato Bozza per questo corso
    await prisma_1.prisma.sessione.deleteMany({
        where: {
            corso_id: corso_id,
            stato: client_1.stato_sessione_enum.Bozza
        }
    });
    // Caricamento sessioni esistenti per controllo OVERLAP (Cache)
    const dataInizio = corso.inizio;
    const dataFine = corso.fine;
    const tutteLeSessioniEsistenti = await prisma_1.prisma.sessione.findMany({
        where: {
            data: { gte: dataInizio, lte: dataFine }
        }
    });
    let cacheSessioni = [...tutteLeSessioniEsistenti];
    // Generazione Slot potenziali
    const slots = (0, availability_service_1.generateSlots)(corso.inizio, corso.fine, corso.mattina_inizio, corso.mattina_fine, corso.pomeriggio_inizio, corso.pomeriggio_fine, giorniDisponibili, ordine);
    // 1. Recupero Moduli del Programma associato al Corso
    const pm = await prisma_1.prisma.programma_modulo.findMany({
        where: { programma_id: corso.programma?.id },
        include: { modulo: true }
    });
    const moduliValidi = pm.filter(item => item.modulo !== null);
    if (moduliValidi.length === 0)
        throw new Error("Nessun modulo trovato nel programma");
    let slotIndex = 0;
    console.log(`[SCHEDULE] Ricevuti ${ordine?.length ?? 0} elementi nell'array ordine.`);
    console.log(`[SCHEDULE] Slots totali generati: ${slots.length}`);
    console.log("=== DIAGNOSTICA SLOT E DATE ===");
    console.log("Data Inizio Corso:", corso.inizio);
    console.log("Data Fine Corso:", corso.fine);
    console.log("Giorni della settimana selezionati:", giorniDisponibili);
    console.log("Totale SLOT potenziali generati da generateSlots:", slots.length);
    console.log("Dettaglio Slots generati:", slots.map(s => `${s.data.toISOString().split('T')[0]} ${s.ora_inizio}-${s.ora_fine}`));
    // 2. LOOP PRINCIPALE SULL'ARRAY 'ordine'
    for (const item of ordine) {
        if (!item)
            continue;
        const relazioneModulo = moduliValidi.find(m => m.modulo_id === item.modulo_id);
        const moduloDb = relazioneModulo?.modulo;
        if (!moduloDb) {
            logger.warn(`Modulo con ID ${item.modulo_id} non trovato tra i moduli del programma. Skip.`);
            continue;
        }
        let oreRimanenti = moduloDb.n_ore ?? 0;
        logger.info(`>>> Inizio Modulo: ${moduloDb.titolo} (ID: ${moduloDb.id}, ${oreRimanenti} ore) - Posizione Ordine: ${item.ordine}`);
        const docentiModulo = docentiAbilitati
            .map(d => d.docente)
            .filter(d => d.docente_modulo.some(dm => dm.modulo_id === moduloDb.id));
        if (docentiModulo.length === 0) {
            logger.error(`Nessun docente abilitato per il modulo ID ${moduloDb.id}`);
            continue;
        }
        // 3. ASSEGNAZIONE DEGLI SLOT PER QUESTO SPECIFICO MODULO
        while (oreRimanenti > 0 && slotIndex < slots.length) {
            const currentSlot = slots[slotIndex];
            try {
                const docente = await (0, availability_service_1.findDocente)(docentiModulo, currentSlot, cacheSessioni);
                const aula = await (0, availability_service_1.findAula)(listaAule, currentSlot, cacheSessioni);
                if (!docente || !aula) {
                    logger.warn(`[SKIP] Slot ${currentSlot.data.toLocaleDateString()} ${currentSlot.ora_inizio}: Docente: ${!!docente}, Aula: ${!!aula}`);
                    slotIndex++;
                    continue;
                }
                const nuovaSessioneDati = {
                    corso_id,
                    docente_cf: docente.codice_fiscale,
                    modulo_id: moduloDb.id,
                    sede_id: aula.sede_id,
                    aula_id: aula.id,
                    data: currentSlot.data,
                    ora_inizio: currentSlot.ora_inizio,
                    ora_fine: currentSlot.ora_fine,
                    stato: client_1.stato_sessione_enum.Bozza,
                    priorita: 1,
                    note: `Modulo: ${moduloDb.titolo} (Posizione ${item.ordine})`
                };
                sessioniBulk.push(nuovaSessioneDati);
                cacheSessioni.push(nuovaSessioneDati);
                oreRimanenti -= currentSlot.durata;
                slotIndex++;
            }
            catch (error) {
                logger.error(`[ERRORE] Slot ${currentSlot.data.toLocaleDateString()}: ${error.message}`);
                slotIndex++;
            }
        }
        if (oreRimanenti > 0) {
            logger.warn(`Modulo ${moduloDb.titolo} (ID: ${moduloDb.id}) terminato con ${oreRimanenti} ore residue (slot esauriti).`);
        }
        else {
            logger.info(`Modulo ${moduloDb.titolo} (ID: ${moduloDb.id}) completato con successo.`);
        }
    }
    // 4. SALVATAGGIO MASSIVO E RETURN
    if (sessioniBulk.length > 0) {
        logger.info(`Salvataggio massivo di ${sessioniBulk.length} sessioni...`);
        await (0, sessione_service_1.createSessioneMany)(sessioniBulk);
    }
    const sessioniCreate = await prisma_1.prisma.sessione.findMany({
        where: { corso_id, stato: client_1.stato_sessione_enum.Bozza },
        orderBy: { data: 'asc' }
    });
    logger.info(`Schedulazione terminata. Create ${sessioniCreate.length} sessioni.`);
    return sessioniCreate;
};
exports.schedule = schedule;
