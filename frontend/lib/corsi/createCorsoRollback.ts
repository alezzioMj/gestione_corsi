import { CorsoData, creaCorso, associaDocenti, associaSedi, generaSessioni, eliminaCorso } from "./corsi";
import { ApiErrorBody } from "@shared/validation/types";

export interface CreaCorsoCompletoInput {
    corsoData: CorsoData;
    docenti: string[];
    sedi: string[];
    giorniDisponibili: number[];
    ordine: { modulo_id: number; ordine: number }[];
}

export async function creaCorsoCompleto(input: CreaCorsoCompletoInput): Promise<number> {
    const { id: corsoId } = await creaCorso(input.corsoData);

    try {
        await associaDocenti(corsoId, input.docenti);
        await associaSedi(corsoId, input.sedi);
        await generaSessioni(corsoId, input.giorniDisponibili, input.ordine);
        return corsoId;
    } catch (error) {
        try {
            await eliminaCorso(corsoId);
        } catch {
            console.error(`ATTENZIONE: rollback fallito, corso ${corsoId} rimasto orfano nel DB`);
        }
        throw error as ApiErrorBody;
    }
}