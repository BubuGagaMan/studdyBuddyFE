// src/shared/theme/useActiveFontLoaded.ts
import { useEffect, useState } from "react";
import { loadFontSet, loadTypewriterFont } from "./loadFontSet";
import { usePreferencesStore } from "./usePreferencesStore";

/**
 * True once the typewriter font and the saved handwriting font have loaded (or failed to -
 * the app then falls back to the system font rather than staying on the splash screen).
 */
export const useActiveFontLoaded = () => {
  const hydrated = usePreferencesStore((state) => state.hasHydrated);
  const font = usePreferencesStore((state) => state.font);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    Promise.all([loadTypewriterFont(), loadFontSet(font)])
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [hydrated]);

  return loaded;
};
