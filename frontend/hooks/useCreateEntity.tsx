// hooks/useCreateEntity.ts
import useSWRMutation from "swr/mutation";
import { postFetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { getErrorMessage } from "@/utils/errorMessages";
import { useCallback } from "react";

export function useCreateEntity<TBody extends object, TResult>(endpoint: string, successMessage?: string) {
    const { trigger: rawTrigger, isMutating } = useSWRMutation(endpoint, postFetcher<TBody, TResult>);
    const trigger = rawTrigger as unknown as (body: TBody) => Promise<TResult | null>;

    const { showMessage } = useSnackbar();

    const create = useCallback(async (body: TBody): Promise<boolean> => {
        try {
            await trigger(body);
            showMessage(successMessage ?? "Creazione andata a buon fine!", "success");
            return true;
        } catch (error) {
            console.error(error);
            showMessage(getErrorMessage(error), "error");
            return false;
        }
    }, [trigger, showMessage, successMessage]);

    return { submitting: isMutating, create };
}