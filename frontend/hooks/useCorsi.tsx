import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { API_ENDPOINTS } from "@/lib/api";
import { Corso } from "@progetto/shared/validation/types";

export function useCorsi(enabled: boolean = true) {
    const { data: corsi = [], isLoading, error } = useSWR<Corso[]>(
        enabled ? API_ENDPOINTS.corsi : null,
        fetcher
    );
    return { corsi, isLoading, error };
}