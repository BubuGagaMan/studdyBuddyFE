// src/shared/hooks/useAsyncAction.ts
import { getApiErrorMessage } from "@/shared/api/errors";
import { useCallback, useState } from "react";

/** Thrown inside an action to show a validation message without calling the API. */
export class ValidationError extends Error {}

/**
 * Runs an async action with a busy flag and a user-facing error message.
 * A ValidationError shows its own message; anything else goes through getApiErrorMessage.
 */
export const useAsyncAction = (fallbackError: string) => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setError(null);
      setIsRunning(true);
      try {
        await action();
      } catch (err) {
        setError(
          err instanceof ValidationError
            ? err.message
            : getApiErrorMessage(err, fallbackError),
        );
      } finally {
        setIsRunning(false);
      }
    },
    [fallbackError],
  );

  return { run, isRunning, error };
};
