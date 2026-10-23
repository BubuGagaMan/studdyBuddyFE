// src/shared/theme/loadFontSet.ts
import { FontName, fontNames, fontSets, typewriterFont } from "./fontSets";
import { loadAsync } from "expo-font";

// Fonts are loaded on demand (only the chosen set at startup), so switching font
// doesn't require every font to be downloaded up front on web.
const loading = new Map<FontName, Promise<void>>();

export const loadFontSet = (name: FontName): Promise<void> => {
  let promise = loading.get(name);
  if (!promise) {
    promise = loadAsync(fontSets[name].assets).catch((error) => {
      loading.delete(name); // allow a retry
      throw error;
    });
    loading.set(name, promise);
  }
  return promise;
};

let typewriterLoading: Promise<void> | null = null;

/** The fixed typewriter font, used whatever handwriting is chosen. */
export const loadTypewriterFont = () => {
  typewriterLoading ??= loadAsync(typewriterFont.assets).catch((error) => {
    typewriterLoading = null; // allow a retry
    throw error;
  });
  return typewriterLoading;
};

/** For the font picker, so each option can preview itself in its own font. */
export const loadAllFontSets = () =>
  Promise.allSettled(fontNames.map((name) => loadFontSet(name)));
