// src/shared/utils/numberText.ts
// Helpers for number inputs: keyboard choice and filters applied as the user types.
import { KeyboardTypeOptions, Platform } from "react-native";

/**
 * Keyboard for a whole-number field. "number-pad" is digits-only everywhere but has no minus
 * key. For negatives, Android's "numeric" pad has one; iOS has no digit pad with a minus, so it
 * gets the full keyboard opened on its numbers layer.
 * (Avoid "numbers-and-punctuation" on Android - it's iOS-only and falls back to letters.)
 */
export const numberKeyboard = (allowNegative = false): KeyboardTypeOptions =>
  allowNegative
    ? Platform.select({ ios: "numbers-and-punctuation", default: "numeric" })
    : "number-pad";

/** Whole non-negative numbers: strips everything but digits. */
export const digitsOnly = (text: string) => text.replace(/[^0-9]/g, "");

/** Whole numbers that may be negative: digits plus a single leading minus. */
export const signedDigitsOnly = (text: string) =>
  text.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, "");
