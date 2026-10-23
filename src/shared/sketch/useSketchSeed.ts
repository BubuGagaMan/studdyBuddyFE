// src/shared/sketch/useSketchSeed.ts
import { useId } from "react";
import { hashString } from "./random";

/**
 * Stable seed for a sketched element. Pass a string (e.g. an item id) to keep the same
 * wobble for the same data; otherwise each component instance gets its own.
 */
export const useSketchSeed = (seed?: string | number): number => {
  const id = useId();
  if (typeof seed === "number") return seed;
  return hashString(seed ?? id);
};
