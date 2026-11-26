import useSWRMutation from "swr/mutation";
import { UpdateArg, updateFetcher } from "@/lib/swr-config";
import { useSnackbar } from "@/components/SnackbarContext";
import { getErrorMessage } from "@/utils/errorMessages";
import { useCallback } from "react";

export function useUpdateEntity<TBody = unknown, TResult = unknown>(
  endpoint: string,
  successMessage = "Modifica salvata con successo!"
) {
  const { trigger: rawTrigger, isMutating } = useSWRMutation<
    TResult | null,
    Error,
    string,
    UpdateArg<TBody>
  >(endpoint, updateFetcher);

  const trigger = rawTrigger as unknown as (
    arg: UpdateArg<TBody>
  ) => Promise<TResult | null>;

  const { showMessage } = useSnackbar();

  const update = useCallback(
    async (
      id: string | number,
      body?: TBody,
      suffix?: string
    ): Promise<boolean> => {
      try {
        await trigger({ id, body, suffix });
        showMessage(successMessage, "success");
        return true;
      } catch (error) {
        console.error(error);
        showMessage(getErrorMessage(error), "error");
        return false;
      }
    },
    [trigger, showMessage, successMessage]
  );

  return { submitting: isMutating, update };
}