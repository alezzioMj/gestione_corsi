import { prisma } from "../prisma";
import { sessione, stato_sessione_enum, Prisma } from "@prisma/client";
import { generateSlots, findDocente, findAula, Ordine, SchedulingError } from "./availability.service";
import { createSessioneMany } from "./sessione.service";

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

export const schedule = async (corso_id: number, giorniDisponibili: number[], ordine: Ordine[]) => {
    console.log("🔥 SCHEDULE V2 - con SchedulingError attivi 🔥");
    return await prisma.$transaction(async (tx) => {
        const sessioniBulk: Prisma.sessioneCreateManyInput[] = [];

        // Caricamento dati iniziali (Pre-fetch)
        const corso = await tx.corso.findUnique({
            where: { id: corso_id },
            include: { programma: true }
        });

        if (!corso || !corso.inizio || !corso.fine) {
            throw new Error("Dati corso insufficienti (date inizio/fine mancanti)");
        }

        const docentiAbilitati = await tx.corso_docente.findMany({
            where: { corso_id },
            include: { docente: { include: { docente_modulo: true } } }
        });

        const corsoConAule = await tx.corso.findUnique({
            where: { id: corso_id },
            select: { corso_sede: { select: { sede: { select: { aula: true } } } } }
        });

        const listaAule = corsoConAule?.corso_sede.flatMap(cs => cs.sede.aula) ?? [];

        // Pulizia sessioni esistenti in stato Bozza per questo corso
        await tx.sessione.deleteMany({
            where: {
                corso_id: corso_id,
                stato: stato_sessione_enum.Bozza
            }
        });

        // Caricamento sessioni esistenti per controllo OVERLAP (Cache)
        const dataInizio = corso.inizio;
        const dataFine = corso.fine;

        const tutteLeSessioniEsistenti = await tx.sessione.findMany({
            where: {
                data: { gte: dataInizio, lte: dataFine }
            }
        });

        let cacheSessioni = [...tutteLeSessioniEsistenti];

        // Generazione Slot potenziali
        const slots = generateSlots(
            corso.inizio,
            corso.fine,
            corso.mattina_inizio!,
            corso.mattina_fine!,
            corso.pomeriggio_inizio!,
            corso.pomeriggio_fine!,
            giorniDisponibili,
        );

        // 1. Recupero Moduli del Programma associato al Corso
        const pm = await tx.programma_modulo.findMany({
            where: { programma_id: corso.programma?.id },
            include: { modulo: true }
        });

        const moduliValidi = pm.filter(item => item.modulo !== null);
        if (moduliValidi.length === 0) throw new Error("Nessun modulo trovato nel programma");

        let slotIndex = 0;

        for (const item of ordine) {
            if (!item) {
                throw new SchedulingError(
                    "INVALID_ORDINE_ITEM",
                    400,
                    "Elemento non valido nell'array ordine",
                    { ordine }
                );
            }

            const relazioneModulo = moduliValidi.find(m => m.modulo_id === item.modulo_id);
            const moduloDb = relazioneModulo?.modulo;

            if (!moduloDb) {
                throw new SchedulingError(
                    "MODULE_NOT_IN_PROGRAM",
                    400,
                    `Il modulo con ID ${item.modulo_id} non fa parte del programma del corso`,
                    { moduloId: item.modulo_id }
                );
            }

            let oreRimanenti = moduloDb.n_ore ?? 0;
            logger.info(`>>> Inizio Modulo: ${moduloDb.titolo} (ID: ${moduloDb.id}, ${oreRimanenti} ore) - Posizione Ordine: ${item.ordine}`);

            const docentiModulo = docentiAbilitati
                .map(d => d.docente)
                .filter(d => d.docente_modulo.some(dm => dm.modulo_id === moduloDb.id));

            if (docentiModulo.length === 0) {
                throw new SchedulingError(
                    "NO_TEACHER_FOR_MODULE",
                    422,
                    `Nessun docente abilitato per il modulo ${moduloDb.titolo}`,
                    { moduloId: moduloDb.id }
                );
            }

            // Loop on slots to find one
            while (oreRimanenti > 0 && slotIndex < slots.length) {
                const currentSlot = slots[slotIndex];

                try {
                    const docente = await findDocente(docentiModulo, currentSlot, cacheSessioni);
                    const aula = await findAula(listaAule, currentSlot, cacheSessioni);

                    if (!docente || !aula) {
                        logger.warn(`[SKIP] Slot ${currentSlot.data.toLocaleDateString()} ${currentSlot.ora_inizio}: Docente: ${!!docente}, Aula: ${!!aula}`);
                        slotIndex++;
                        continue;
                    }

                    const nuovaSessioneDati: Prisma.sessioneCreateManyInput = {
                        corso_id,
                        docente_cf: docente.codice_fiscale,
                        modulo_id: moduloDb.id,
                        sede_id: aula.sede_id,
                        aula_id: aula.id,
                        data: currentSlot.data,
                        ora_inizio: currentSlot.ora_inizio,
                        ora_fine: currentSlot.ora_fine,
                        stato: stato_sessione_enum.Bozza,
                        priorita: 1,
                        note: `Modulo: ${moduloDb.titolo} (Posizione ${item.ordine})`
                    };

                    sessioniBulk.push(nuovaSessioneDati);
                    cacheSessioni.push(nuovaSessioneDati as any);

                    oreRimanenti -= currentSlot.durata;
                    slotIndex++;

                } catch (error) {
                    if (error instanceof SchedulingError) throw error;
                    logger.error(`[ERRORE INATTESO] Slot ${currentSlot.data.toLocaleDateString()}: ${(error as Error).message}`);
                    throw error;
                }
            }

            if (oreRimanenti > 0) {
                throw new SchedulingError(
                    "INSUFFICIENT_SLOTS",
                    409,
                    `Slot esauriti per il modulo ${moduloDb.titolo}: mancano ${oreRimanenti} ore`,
                    { moduloId: moduloDb.id, oreMancanti: oreRimanenti }
                );
            } else {
                logger.info(`Modulo ${moduloDb.titolo} (ID: ${moduloDb.id}) completato con successo.`);
            }
        }

        // 4. SALVATAGGIO MASSIVO E RETURN
        if (sessioniBulk.length > 0) {
            logger.info(`Salvataggio massivo di ${sessioniBulk.length} sessioni...`);
        }

        const sessioniCreate = await tx.sessione.findMany({
            where: { corso_id, stato: stato_sessione_enum.Bozza },
            orderBy: { data: 'asc' }
        });

        logger.info(`Schedulazione terminata. Create ${sessioniCreate.length} sessioni.`);
        return sessioniCreate;
    })
};