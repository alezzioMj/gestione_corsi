// hooks/useDocentiByCorso.ts
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { API_ENDPOINTS } from "@/lib/api";
import { Sede } from "@shared/validation/types";

type SedeCorsoRow = {
    corso_id: number;
    sede_id: string;
    n_ore: number;
    sede: Sede;
};

export function useSediByCorso(enabled: boolean, corsoId?: number | null) {
    const { data: rows, isLoading, error } = useSWR<SedeCorsoRow[]>(
        enabled && corsoId ? `${API_ENDPOINTS.corsi}${corsoId}/sedi` : null,
        fetcher
    );

    const sedi: Sede[] = rows?.map((r) => r.sede) ?? [];

    return { sedi, isLoading, error };
}