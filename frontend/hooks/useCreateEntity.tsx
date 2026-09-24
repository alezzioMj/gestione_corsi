// hooks/useCreateEntity.ts
import useSWRMutation from "swr/mutation";
import { postFetcher } from "@/lib/swr-config";


export function useCreateEntity(endpoint: string) {
    const { trigger, isMutating } = useSWRMutation(endpoint, postFetcher);

    const create = async (body: object): Promise<boolean> => {
        try {
            await trigger(body);
            return true;
        } catch (error) {
            alert(error instanceof TypeError ? "Errore di rete." : `Errore: ${(error as Error).message}`);
            return false;
        }
    };

    return { submitting: isMutating, create };
}