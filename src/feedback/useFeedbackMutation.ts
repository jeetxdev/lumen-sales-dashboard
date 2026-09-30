import { useMutation } from '@tanstack/react-query';
import { useToasts } from './Toaster';

interface FeedbackMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Refreshes queries after a success. The success toast waits for it, so the screen and the message agree. */
  onSuccess?: (data: TData, variables: TVariables) => Promise<unknown> | void;
  success: (data: TData, variables: TVariables) => string;
  /** A dialog shows its error next to the fields, so a toast would repeat it. */
  inlineError?: boolean;
}

export const FALLBACK_ERROR = 'Something went wrong. Try again.';

/**
 * Every write goes through this hook, so each one reports success and failure the same way.
 * Callers read `isPending` and `variables` to disable the control that started the request.
 */
export function useFeedbackMutation<TData, TVariables>({ mutationFn, onSuccess, success, inlineError = false }: FeedbackMutationOptions<TData, TVariables>) {
  const toasts = useToasts();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async (data, variables) => {
      await onSuccess?.(data, variables);
      toasts.push('success', success(data, variables));
    },
    onError: (error) => {
      if (!inlineError) toasts.push('error', error.message || FALLBACK_ERROR);
    },
  });
}
