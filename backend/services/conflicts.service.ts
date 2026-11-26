// backend/services/conflitti.service.ts
import { Prisma, stato_sessione_enum } from "@prisma/client";
import { prisma } from "../prisma";
import { verificaSessioni, type SessioneDaVerificare, type SessioneCache } from "./availability.service";

type Db = Prisma.TransactionClient | typeof prisma;

export const calcolaConflitti = async (
    db: Db,
    corsoId: number,
    sessioni: SessioneDaVerificare[],
) => {
    if (sessioni.length === 0) return [];

    const date = sessioni.map((s) => new Date(s.data).getTime());
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

    return verificaSessioni(sessioni, cache, indisponibilita);
};

type RigaSessione = {
    id: number;
    data: Date;
    ora_inizio: string;
    ora_fine: string;
    docente_cf: string | null;
    aula_id: number | null;
    sede_id: number | null;
};

/** Separa le sessioni complete (verificabili) da quelle a cui manca docente, aula o sede */
export const daVerificare = (righe: RigaSessione[]) => {
    const complete: SessioneDaVerificare[] = [];
    const incomplete: number[] = [];

    for (const r of righe) {
        if (r.docente_cf && r.aula_id && r.sede_id) {
            complete.push({
                id: r.id,
                data: r.data,
                ora_inizio: r.ora_inizio,
                ora_fine: r.ora_fine,
                docente_cf: r.docente_cf,
                aula_id: r.aula_id,
                sede_id: r.sede_id,
            });
        } else {
            incomplete.push(r.id);
        }
    }
    return { complete, incomplete };
};