// hooks/useAuleBySede.ts
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { ProgrammaWithRelations } from "@progetto/shared/validation/programma.schema";

export function useModuliByCorso(enabled: boolean, programmaId?: number | null) {
    const { data: programmi = [], isLoading, error } = useSWR<ProgrammaWithRelations[]>(
        enabled ? "/programmi" : null,
        fetcher
    );

    const programma = programmaId
    ? programmi.find((p) => p.id === programmaId)
    : undefined;
    const moduli = programma?.moduli;

    return { moduli, isLoading, error };
}