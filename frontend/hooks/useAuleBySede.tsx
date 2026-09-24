// hooks/useAuleBySede.ts
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import type { Aula } from "@shared/validation/types";

export function useAuleBySede(enabled: boolean, sedeId?: number | null) {
    const { data: aule = [], isLoading, error } = useSWR<Aula[]>(
        enabled ? "/aule" : null,
        fetcher
    );

    const auleFiltrate = sedeId ? aule.filter((a) => a.sede_id === sedeId) : [];

    return { aule: auleFiltrate, isLoading, error };
}