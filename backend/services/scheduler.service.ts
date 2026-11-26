import { prisma } from "../prisma";
import { aula as AulaDb, docente as DocenteDb, Prisma, stato_sessione_enum } from "@prisma/client";
import {
    generateSlots,
    findDocente,
    findAula,
    verificaSessioni,
    SchedulingError,
    type Ordine,
    type Slot,
    type SessioneCache,
} from "./availability.service";
import { withTransaction } from "../utils/with.transaction";
import { Sessione } from "@progetto/shared/validation/sessione.schema";
import { calcolaConflitti, daVerificare } from "./conflicts.service";

type ScheduleOptions = { tx?: Prisma.TransactionClient };

enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
}

const logger = {
    debug: (msg: string, ...args: any[]) => { if (process.env.LOG_LEVEL === LogLevel.DEBUG) console.debug(msg, ...args); },
    info: (msg: string, ...args: any[]) => { console.info(msg, ...args); },
    warn: (msg: string, ...args: any[]) => { console.warn(msg, ...args); },
    error: (msg: string, ...args: any[]) => { console.error(msg, ...args); },
};

const trovaAssegnazione = (
    listaAule: AulaDb[],
    docentiModulo: DocenteDb[],
    slot: Slot,
    cache: SessioneCache[],
    indisponibilita: Parameters<typeof findAula>[3],
) => {
    for (const aula of listaAule) {
        if (!findAula([aula], slot, cache, indisponibilita)) continue;
        const docente = findDocente(docentiModulo, slot, aula.sede_id, cache, indisponibilita);
        if (docente) return { aula, docente };
    }
    return null;
};

// ---------------------------------------------------------------------------
// Generazione: crea SEMPRE bozze (le bozze precedenti del corso vengono sostituite)
// ---------------------------------------------------------------------------

export const schedule = (
    corso_id: number,
    giorniDisponibili: number[],
    ordine: Ordine[],
    { tx }: ScheduleOptions = {},
): Promise<Sessione[]> =>
    withTransaction(
        tx,
        async (db) => {
            const corso = await db.corso.findUnique({
                where: { id: corso_id },
                include: {
                    corso_sede: { include: { sede: { include: { aula: true } } } },
                },
            });

            if (!corso || !corso.inizio || !corso.fine) {
                throw new SchedulingError(
                    "INVALID_COURSE", 422,
                    "Dati corso insufficienti (date inizio/fine mancanti)",
                );
            }
            if (!corso.programma_id) {
                throw new SchedulingError("NO_PROGRAM", 422, "Il corso non ha un programma associato");
            }

            const dataInizio = corso.inizio;
            const dataFine = corso.fine;

            const docentiAbilitati = await db.corso_docente.findMany({
                where: { corso_id },
                include: { docente: { include: { docente_modulo: true } } },
            });

            const listaAule = corso.corso_sede.flatMap((cs) => cs.sede.aula);

            // Rigenerare sostituisce le bozze del corso (e le toglie dal confronto qui sotto)
            await db.sessione.deleteMany({
                where: { corso_id, stato: stato_sessione_enum.Bozza },
            });

            // Occupano risorse solo le sessioni non in bozza: le bozze di altri corsi non bloccano
            const sessioniEsistenti = await db.sessione.findMany({
                where: {
                    data: { gte: dataInizio, lte: dataFine },
                    stato: { not: stato_sessione_enum.Bozza },
                },
            });

            const indisponibilita = await db.indisponibilita.findMany({
                where: {
                    data_inizio: { lte: dataFine },
                    data_fine: { gte: dataInizio },
                },
            });

            const cacheSessioni: SessioneCache[] = [...sessioniEsistenti];

            const slots = generateSlots(
                dataInizio,
                dataFine,
                corso.mattina_inizio!,
                corso.mattina_fine!,
                corso.pomeriggio_inizio!,
                corso.pomeriggio_fine!,
                giorniDisponibili,
            );

            const pm = await db.programma_modulo.findMany({
                where: { programma_id: corso.programma_id },
                include: { modulo: true },
            });

            const moduliValidi = pm.filter((item) => item.modulo !== null);
            if (moduliValidi.length === 0) {
                throw new SchedulingError("NO_MODULES", 422, "Nessun modulo trovato nel programma");
            }

            const sessioniBulk: Prisma.sessioneCreateManyInput[] = [];
            let slotIndex = 0;

            for (const item of ordine) {
                if (!item) {
                    throw new SchedulingError(
                        "INVALID_ORDINE_ITEM", 400,
                        "Elemento non valido nell'array ordine", { ordine },
                    );
                }

                const moduloDb = moduliValidi.find((m) => m.modulo_id === item.modulo_id)?.modulo;
                if (!moduloDb) {
                    throw new SchedulingError(
                        "MODULE_NOT_IN_PROGRAM", 400,
                        `Il modulo con ID ${item.modulo_id} non fa parte del programma del corso`,
                        { moduloId: item.modulo_id },
                    );
                }

                let oreRimanenti = moduloDb.n_ore ?? 0;
                logger.info(`>>> Inizio Modulo: ${moduloDb.titolo} (ID: ${moduloDb.id}, ${oreRimanenti} ore) - Posizione Ordine: ${item.ordine}`);

                const docentiModulo = docentiAbilitati
                    .map((d) => d.docente)
                    .filter((d) => d.docente_modulo.some((dm) => dm.modulo_id === moduloDb.id));

                if (docentiModulo.length === 0) {
                    throw new SchedulingError(
                        "NO_TEACHER_FOR_MODULE", 422,
                        `Nessun docente abilitato per il modulo ${moduloDb.titolo}`,
                        { moduloId: moduloDb.id },
                    );
                }

                while (oreRimanenti > 0 && slotIndex < slots.length) {
                    const currentSlot = slots[slotIndex];
                    const assegnazione = trovaAssegnazione(
                        listaAule, docentiModulo, currentSlot, cacheSessioni, indisponibilita,
                    );

                    if (!assegnazione) {
                        logger.debug(`[SKIP] Slot ${currentSlot.data.toISOString().slice(0, 10)} ${currentSlot.ora_inizio}: nessuna combinazione aula/docente libera`);
                        slotIndex++;
                        continue;
                    }

                    const { aula, docente } = assegnazione;

                    sessioniBulk.push({
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
                        note: `Modulo: ${moduloDb.titolo} (Posizione ${item.ordine})`,
                    });

                    cacheSessioni.push({
                        id: undefined,
                        docente_cf: docente.codice_fiscale,
                        aula_id: aula.id,
                        data: currentSlot.data,
                        ora_inizio: currentSlot.ora_inizio,
                        ora_fine: currentSlot.ora_fine,
                    });

                    oreRimanenti -= currentSlot.durata;
                    slotIndex++;
                }

                if (oreRimanenti > 0) {
                    throw new SchedulingError(
                        "INSUFFICIENT_SLOTS", 409,
                        `Slot esauriti per il modulo ${moduloDb.titolo}: mancano ${oreRimanenti} ore`,
                        { moduloId: moduloDb.id, oreMancanti: oreRimanenti },
                    );
                }
                logger.info(`Modulo ${moduloDb.titolo} (ID: ${moduloDb.id}) completato con successo.`);
            }

            if (sessioniBulk.length > 0) {
                logger.info(`Salvataggio massivo di ${sessioniBulk.length} sessioni...`);
                await db.sessione.createMany({ data: sessioniBulk });
            }

            const sessioniCreate = await db.sessione.findMany({
                where: { corso_id, stato: stato_sessione_enum.Bozza },
                orderBy: [{ data: "asc" }, { ora_inizio: "asc" }],
            });

            logger.info(`Schedulazione terminata. Create ${sessioniCreate.length} sessioni.`);
            return sessioniCreate;
        },
        { timeout: 20_000 },
    );

// ---------------------------------------------------------------------------
// Contesto: sessioni di ALTRI corsi che condividono docenti, aule o sedi
// ---------------------------------------------------------------------------

export const findContestoSessioni = (
    db: Prisma.TransactionClient | typeof prisma,
    p: { from: Date; to: Date; docenti: string[]; aule: number[]; sedi: number[]; corsoId: number },
) =>
    db.sessione.findMany({
        where: {
            data: { gte: p.from, lte: p.to },
            corso_id: { not: p.corsoId },
            OR: [
                { docente_cf: { in: p.docenti } },
                { aula_id: { in: p.aule } },
                { sede_id: { in: p.sedi } },
            ],
        },
        orderBy: [{ data: "asc" }, { ora_inizio: "asc" }],
    });
// Chi la usa distingue per `stato`: quelle non in bozza sono conflitti, le bozze solo avvisi.

// ---------------------------------------------------------------------------
// Conferma: ricontrolla e passa le bozze del corso a "confermata"
// ---------------------------------------------------------------------------

const MAX_RETRY = 3;

// Con isolamento Serializable Postgres può abortire una transazione (P2034): si riprova
async function conRetry<T>(fn: () => Promise<T>): Promise<T> {
    for (let tentativo = 1; ; tentativo++) {
        try {
            return await fn();
        } catch (err) {
            const serializzazione =
                err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034";
            if (!serializzazione || tentativo >= MAX_RETRY) throw err;
        }
    }
}

export const confermaBozze = (corsoId: number, tx?: Prisma.TransactionClient): Promise<number> => {
    const run = () =>
        withTransaction(
            tx,
            async (db) => {
                const bozze = await db.sessione.findMany({
                    where: { corso_id: corsoId, stato: stato_sessione_enum.Bozza },
                });

                if (bozze.length === 0) {
                    throw new SchedulingError("NO_DRAFTS", 404, "Nessuna bozza da confermare");
                }


                const { complete, incomplete } = daVerificare(bozze);
                if (incomplete.length > 0) {
                    throw new SchedulingError("INCOMPLETE_DRAFTS", 422, "Alcune bozze non hanno docente, aula o sede", { ids: incomplete });
                }
                
                if (incomplete.length > 0) {
                    throw new SchedulingError(
                        "INCOMPLETE_DRAFTS", 422,
                        "Alcune bozze non hanno docente, aula o sede",
                        { ids: incomplete.map((b) => b.id) },
                    );
                }

                const date = bozze.map((b) => new Date(b.data).getTime());
                const from = new Date(Math.min(...date));
                const to = new Date(Math.max(...date));

                const cache: SessioneCache[] = await db.sessione.findMany({
                    where: {
                        data: { gte: from, lte: to },
                        OR: [
                            { stato: { not: stato_sessione_enum.Bozza } },
                            { corso_id: corsoId, stato: stato_sessione_enum.Bozza },
                        ],
                    },
                });

                const indisponibilita = await db.indisponibilita.findMany({
                    where: { data_inizio: { lte: to }, data_fine: { gte: from } },
                });

                const conInConflitto = (await calcolaConflitti(db, corsoId, complete)).filter((r) => r.conflitti.length > 0);

                if (conInConflitto.length > 0) {
                    throw new SchedulingError(
                        "CONFLICTS", 409,
                        `${conInConflitto.length} sessioni in conflitto: modificale prima di confermare`,
                        { conflitti: conInConflitto },
                    );
                }

                const { count } = await db.sessione.updateMany({
                    where: { corso_id: corsoId, stato: stato_sessione_enum.Bozza },
                    data: { stato: stato_sessione_enum.Confermata }, // adatta al nome reale del tuo enum
                });
                return count;
            },
            { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );

    // Il retry ha senso solo se la transazione la apriamo noi
    return tx ? run() : conRetry(run);
};

// ---------------------------------------------------------------------------
// Scarto delle bozze
// ---------------------------------------------------------------------------

export const scartaBozze = (corsoId: number, tx?: Prisma.TransactionClient): Promise<number> =>
    withTransaction(tx, async (db) => {
        const { count } = await db.sessione.deleteMany({
            where: { corso_id: corsoId, stato: stato_sessione_enum.Bozza },
        });
        return count;
    });