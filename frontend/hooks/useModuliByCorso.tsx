// hooks/useAuleBySede.ts
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";

export function useModuliByCorso(enabled: boolean, programmaId?: number | null) {
    const { data: programmi = [], isLoading, error } = useSWR<ProgrammaWithRelations<"programma_modulo">[]>(
        enabled ? "/programmi" : null,
        fetcher
    );

    const programma = programmaId
    ? programmi.find((p) => p.id === programmaId)
    : undefined;
    const moduli = programma?.programma_modulo;

    return { moduli, isLoading, error };
}