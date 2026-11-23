// hooks/useCreateEntity.ts
import useSWRMutation from "swr/mutation";
import { updateFetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { getErrorMessage } from "@/utils/errorMessages";
import { useCallback } from "react";


export function useUpdateEntity(endpoint: string) {
    const { trigger, isMutating } = useSWRMutation(endpoint, updateFetcher);
    const { showMessage } = useSnackbar();

    const update = useCallback(async (body: object): Promise<boolean> => {
        try {
            await trigger(body);
            return true;
        } catch (error) {
            console.error(error);
            showMessage(getErrorMessage(error), "error");
            return false;
        }
    }, [trigger, showMessage]);

    return { submitting: isMutating, update };
}