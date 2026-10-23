// src/shared/api/errors.ts
import { isAxiosError } from "axios";

/** The backend's `message` field if present, otherwise a fallback suitable for the UI. */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (!error.response) return "Can't reach the server. Check your connection.";
  }
  return fallback;
};
