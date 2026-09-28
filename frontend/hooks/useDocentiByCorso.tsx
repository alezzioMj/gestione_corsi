// hooks/useDocentiByCorso.ts
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { API_ENDPOINTS } from "@/lib/api";
import { Docente } from "@progetto/shared/validation/types";

type DocenteCorsoRow = {
    docente_cf: string;
    modulo_id : number,
    docente: Docente;
};

export function useDocentiByCorso(
    enabled: boolean,
    corsoId?: number | null,
    moduloId?: number | null
) {
    const { data: rows = [], isLoading, error } = useSWR<DocenteCorsoRow[]>(
        enabled && corsoId && moduloId
            ? `${API_ENDPOINTS.corsi}${corsoId}/docenti/${moduloId}`
            : null,
        fetcher
    );

    const docenti : Docente[] = rows?.map((r)=> r.docente) || [];

    return { docenti, isLoading, error };
}