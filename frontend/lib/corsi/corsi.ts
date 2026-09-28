import { API_BASE_URL } from "@/lib/config";
import { ApiErrorBody } from "@progetto/shared/validation/types";

async function parseErrorResponse(res: Response): Promise<ApiErrorBody> {
    try {
        const data = await res.json();
        return {
            code: data.code ?? "UNKNOWN_ERROR",
            message: data.message ?? "Errore sconosciuto",
            details: data.details,
        };
    } catch {
        return { code: "UNKNOWN_ERROR", message: "Errore sconosciuto" };
    }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw await parseErrorResponse(res);
    return res.json();
}

export interface CorsoData {
    nome: string;
    cliente: string;
    programma_id: number;
    n_ore: number;
    inizio: string;
    fine: string;
    mattina_inizio: string;
    mattina_fine: string;
    pomeriggio_inizio: string;
    pomeriggio_fine: string;
    note?: string;
}

export const creaCorso = (data: CorsoData) =>
    postJson<{ id: number }>(`${API_BASE_URL}/corsi`, data);

export const associaDocenti = (corsoId: number, docentiCfs: string[]) =>
    postJson(`${API_BASE_URL}/corsi/${corsoId}/docenti`, { docenti_cfs: docentiCfs });

export const associaSedi = (corsoId: number, sediNames: string[]) =>
    postJson(`${API_BASE_URL}/corsi/${corsoId}/sedi`, { sedi_names: sediNames });

export const generaSessioni = (
    corsoId: number,
    giorniDisponibili: number[],
    ordine: { modulo_id: number; ordine: number }[]
) => postJson(`${API_BASE_URL}/corsi/${corsoId}/schedule`, { giorniDisponibili, ordine });

export const eliminaCorso = (corsoId: number) =>
    fetch(`${API_BASE_URL}/corsi/${corsoId}`, { method: "DELETE" });