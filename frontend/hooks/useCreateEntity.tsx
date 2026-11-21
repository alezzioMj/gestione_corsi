// hooks/useCreateEntity.ts
import useSWRMutation from "swr/mutation";
import { postFetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { getErrorMessage } from "@/utils/errorMessages";


export function useCreateEntity(endpoint: string) {
    const { trigger, isMutating } = useSWRMutation(endpoint, postFetcher);
    const { showMessage } = useSnackbar();

    const create = async (body: object): Promise<boolean> => {
        try {
            await trigger(body);
            return true;
        } catch (error) {
            console.error(error);
            showMessage(getErrorMessage(error), "error");
            return false;
        }
    };

    return { submitting: isMutating, create };
}