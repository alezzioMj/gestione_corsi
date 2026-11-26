// hooks/useCreateEntity.ts
import useSWRMutation from "swr/mutation";
import { CreateArg, postFetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { getErrorMessage } from "@/utils/errorMessages";
import { useCallback } from "react";

export type CreateEntityResult<TResult> = {
  ok: boolean;
  data: TResult | null;
};

export function useCreateEntity<TBody = unknown, TResult = unknown>(
  endpoint: string,
  successMessage = "Creazione andata a buon fine!"
) {
  const { trigger: rawTrigger, isMutating } = useSWRMutation<
    TResult | null,
    Error,
    string,
    CreateArg<TBody>
  >(endpoint, postFetcher);

  const trigger = rawTrigger as unknown as (
    arg: CreateArg<TBody>
  ) => Promise<TResult | null>;

  const { showMessage } = useSnackbar();

  const create = useCallback(
    async (
      body?: TBody,
      id?: string | number,
      suffix?: string
    ): Promise<CreateEntityResult<TResult>> => {
      try {
        const data = await trigger({ body, id, suffix });
        showMessage(successMessage, "success");
        return { ok: true, data };
      } catch (error) {
        console.error(error);
        showMessage(getErrorMessage(error), "error");
        return { ok: false, data: null };
      }
    },
    [trigger, showMessage, successMessage]
  );

  return { submitting: isMutating, create };
}