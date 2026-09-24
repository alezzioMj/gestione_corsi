// hooks/useAuleBySede.ts
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { ProgrammaConModuli } from "@/validation/corso-form.schema";

export function useModuliByCorso(enabled: boolean, programmaId?: number | null) {
    const { data: programmi = [], isLoading, error } = useSWR<ProgrammaConModuli[]>(
        enabled ? "/programmi" : null,
        fetcher
    );

    const programma = programmaId
    ? programmi.find((p) => p.id === programmaId)
    : undefined;
    const moduli = programma?.programma_modulo;

    return { moduli, isLoading, error };
}