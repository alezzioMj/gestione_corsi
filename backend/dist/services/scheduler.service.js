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
    const sessioniBulk = []; // Array per il bulk insert
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
    //Pulizia sessioni esistenti 
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
    // cache locale con le sessioni già presenti nel DB
    let cacheSessioni = [...tutteLeSessioniEsistenti];
    // Generazione Slot potenziali
    const slots = (0, availability_service_1.generateSlots)(corso.inizio, corso.fine, corso.mattina_inizio, corso.mattina_fine, corso.pomeriggio_inizio, corso.pomeriggio_fine, giorniDisponibili, ordine);
    // Recupero Moduli del Programma
    const pm = await prisma_1.prisma.programma_modulo.findMany({
        where: { programma_id: corso.programma?.id },
        include: { modulo: true },
        orderBy: { ordine: 'asc' }
    });
    const moduliValidi = pm.filter(item => item.modulo !== null);
    if (moduliValidi.length === 0)
        throw new Error("Nessun modulo trovato nel programma");
    // Ordina i moduli in base all'array di input 'ordine'
    moduliValidi.sort((a, b) => {
        const orderA = ordine.find(o => o.modulo_id === a.modulo_id)?.ordine ?? 999;
        const orderB = ordine.find(o => o.modulo_id === b.modulo_id)?.ordine ?? 999;
        return orderA - orderB;
    });
    let slotIndex = 0;
    // LOOP PRINCIPALE SUI MODULI
    for (const { modulo } of moduliValidi) {
        if (!modulo)
            continue;
        let oreRimanenti = modulo.n_ore ?? 0;
        logger.info(`>>> Inizio Modulo: ${modulo.id} (${oreRimanenti} ore)`);
        // Filtro docenti per competenza modulo
        const docentiModulo = docentiAbilitati
            .map(d => d.docente)
            .filter(d => d.docente_modulo.some(dm => dm.modulo_id === modulo.id));
        if (docentiModulo.length === 0) {
            logger.error(`Nessun docente abilitato per il modulo ${modulo.id}`);
            continue;
        }
        while (oreRimanenti > 0 && slotIndex < slots.length) {
            const currentSlot = slots[slotIndex];
            try {
                // Caricamento risorese
                const docente = await (0, availability_service_1.findDocente)(docentiModulo, currentSlot, cacheSessioni);
                const aula = await (0, availability_service_1.findAula)(listaAule, currentSlot, cacheSessioni);
                if (!docente || !aula) {
                    logger.warn(`[SKIP] Slot ${currentSlot.data.toLocaleDateString()} ${currentSlot.ora_inizio}: Docente trovato: ${!!docente}, Aula trovata: ${!!aula}. Docenti testati: ${docentiModulo.length}, Aule testate: ${listaAule.length}`);
                    slotIndex++;
                    continue;
                }
                const nuovaSessioneDati = {
                    corso_id,
                    docente_cf: docente.codice_fiscale,
                    modulo_id: modulo.id,
                    sede_id: aula.sede_id,
                    aula_id: aula.id,
                    data: currentSlot.data,
                    ora_inizio: currentSlot.ora_inizio,
                    ora_fine: currentSlot.ora_fine,
                    stato: client_1.stato_sessione_enum.Bozza,
                    priorita: 1,
                    note: `Modulo: ${modulo.id}`
                };
                sessioniBulk.push(nuovaSessioneDati);
                // Aggiornamento cache locale
                cacheSessioni.push(nuovaSessioneDati);
                oreRimanenti -= currentSlot.durata;
                slotIndex++;
            }
            catch (error) {
                logger.error(`[ERRORE] Slot ${currentSlot.data.toLocaleDateString()}: ${error.message}`);
                slotIndex++;
            }
        }
        // Log alla fine del ciclo 'while' per un modulo
        if (oreRimanenti > 0) {
            logger.warn(`Modulo ${modulo.id} terminato con ${oreRimanenti} ore residue (slot disponibili esauriti).`);
        }
        else {
            logger.info(`Modulo ${modulo.id} completato con successo.`);
        }
    }
    if (sessioniBulk.length > 0) {
        logger.info(`Salvataggio massivo di ${sessioniBulk.length} sessioni...`);
        await (0, sessione_service_1.createSessioneMany)(sessioniBulk);
    }
    // Recupero finale 
    const sessioniCreate = await prisma_1.prisma.sessione.findMany({
        where: { corso_id, stato: client_1.stato_sessione_enum.Bozza },
        orderBy: { data: 'asc' }
    });
    logger.info(`Schedulazione terminata. Create ${sessioniCreate.length} sessioni.`);
    return sessioniCreate;
};
exports.schedule = schedule;
