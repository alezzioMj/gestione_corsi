import { prisma } from "../prisma";
import { sessione, stato_sessione_enum } from "@prisma/client";
import { generateSlots, findDocente, findAula } from "./availability.service";
import { createSessioneMany } from "./sessione.service";
import { Prisma } from "../generated/prisma/browser";

enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}

const logger = {
    debug: (msg: string, ...args: any[]) => { if (process.env.LOG_LEVEL === LogLevel.DEBUG) console.debug(msg, ...args); },
    info: (msg: string, ...args: any[]) => { console.info(msg, ...args); },
    warn: (msg: string, ...args: any[]) => { console.warn(msg, ...args); },
    error: (msg: string, ...args: any[]) => { console.error(msg, ...args); }
};

export const schedule = async (corso_id: number, giorniDisponibili: number[]) => {
    const sessioniBulk: any[] = []; // Array per il bulk insert
    // Caricamento dati iniziali (Pre-fetch)
    const corso = await prisma.corso.findUnique({
        where: { id: corso_id },
        include: { programma: true }
    });

    if (!corso || !corso.inizio || !corso.fine) {
        throw new Error("Dati corso insufficienti (date inizio/fine mancanti)");
    }

    const docentiAbilitati = await prisma.corso_docente.findMany({
        where: { corso_id },
        include: { docente: { include: { docente_modulo: true } } }
    });

    const corsoConAule = await prisma.corso.findUnique({
        where: { id: corso_id },
        select: { corso_sede: { select: { sede: { select: { aula: true } } } } }
    });

    const listaAule = corsoConAule?.corso_sede.flatMap(cs => cs.sede.aula) ?? [];

    //Pulizia sessioni esistenti 
    await prisma.sessione.deleteMany({
        where: {
            corso_id: corso_id,
            stato: stato_sessione_enum.Bozza
        }
    });

    // Caricamento sessioni esistenti per controllo OVERLAP (Cache)
    const dataInizio = corso.inizio;
    const dataFine = corso.fine;

    const tutteLeSessioniEsistenti = await prisma.sessione.findMany({
        where: {
            data: { gte: dataInizio, lte: dataFine }
        }
    });

    // cache locale con le sessioni già presenti nel DB
    let cacheSessioni = [...tutteLeSessioniEsistenti];

    // Generazione Slot potenziali
    const slots = generateSlots(
        corso.inizio,
        corso.fine,
        corso.mattina_inizio!,
        corso.mattina_fine!,
        corso.pomeriggio_inizio!,
        corso.pomeriggio_fine!,
        giorniDisponibili
    );

    // Recupero Moduli del Programma
    const pm = await prisma.programma_modulo.findMany({
        where: { programma_id: corso.programma?.id },
        include: { modulo: true },
        orderBy: { ordine: 'asc' }
    });

    const moduliValidi = pm.filter(item => item.modulo !== null);
    if (moduliValidi.length === 0) throw new Error("Nessun modulo trovato nel programma");

    let slotIndex = 0;

    // LOOP PRINCIPALE SUI MODULI
    for (const { modulo } of moduliValidi) {
        if (!modulo) continue;

        let oreRimanenti = modulo.n_ore;
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
                const docente = await findDocente(docentiModulo, currentSlot, cacheSessioni);
                const aula = await findAula(listaAule, currentSlot, cacheSessioni);

                if (!docente || !aula) {
                    logger.warn(`[SKIP] Slot ${currentSlot.data.toLocaleDateString()} ${currentSlot.ora_inizio}: Docente trovato: ${!!docente}, Aula trovata: ${!!aula}. Docenti testati: ${docentiModulo.length}, Aule testate: ${listaAule.length}`);
                    slotIndex++;
                    continue;
                }

                const nuovaSessioneDati: Prisma.sessioneCreateManyInput = {
                    corso_id,
                    docente_cf: docente.codice_fiscale,
                    modulo_id: modulo.id,
                    sede_id: aula.sede_id,
                    aula_id: aula.id,
                    data: currentSlot.data,
                    ora_inizio: currentSlot.ora_inizio,
                    ora_fine: currentSlot.ora_fine,
                    stato: stato_sessione_enum.Bozza,
                    priorita: 1,
                    note: `Modulo: ${modulo.id}`
                };

                sessioniBulk.push(nuovaSessioneDati);

                // Aggiornamento cache locale
                cacheSessioni.push(nuovaSessioneDati as any);

                oreRimanenti -= currentSlot.durata;
                slotIndex++;

            } catch (error: any) {
                logger.error(`[ERRORE] Slot ${currentSlot.data.toLocaleDateString()}: ${error.message}`);
                slotIndex++;
            }
            if (oreRimanenti > 0) {
                logger.warn(`Modulo ${modulo.id} terminato con ${oreRimanenti} ore residue (Fine slot disponibili).`);
            } else {
                logger.info(`Modulo ${modulo.id} completato con successo.`);
            }
        }
    }
    if (sessioniBulk.length > 0) {
        logger.info(`Salvataggio massivo di ${sessioniBulk.length} sessioni...`);
        await createSessioneMany(sessioniBulk);
    }

    // Recupero finale 
    const sessioniCreate = await prisma.sessione.findMany({
        where: { corso_id, stato: stato_sessione_enum.Bozza },
        orderBy: { data: 'asc' }
    });

    return sessioniCreate;


    logger.info(`Schedulazione terminata. Create ${sessioniCreate.length} sessioni.`);
    return sessioniCreate;
};
