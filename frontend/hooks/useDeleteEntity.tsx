// hooks/useCreateEntity.ts
import useSWRMutation from "swr/mutation";
import { deleteFetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { getErrorMessage } from "@/utils/errorMessages";
import { useCallback } from "react";


export function useDeleteEntity(endpoint: string) {
    const { trigger, isMutating } = useSWRMutation(endpoint, deleteFetcher);
    const { showMessage } = useSnackbar();

    const remove = useCallback(async (): Promise<boolean> => {
        try {
            await trigger();
            showMessage("Elemento eliminato correttamente", "success");
            return true;
        } catch (error) {
            console.error(error);
            showMessage(getErrorMessage(error), "error");
            return false;
        }
    }, [trigger, showMessage]);

    return { submitting: isMutating, remove };
}