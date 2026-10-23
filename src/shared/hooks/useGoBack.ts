// src/shared/hooks/useGoBack.ts
import { useRouter } from "expo-router";

/** Back to the previous screen, or to the home list when there's no history (e.g. a deep link). */
export const useGoBack = () => {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace("/"));
};
