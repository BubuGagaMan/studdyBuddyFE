// src/shared/theme/fontSets.ts
// Handwriting fonts the user can pick from, plus the fixed typewriter font. Each weight is
// imported from its own subpath so only the files listed here end up in the bundle.
import { CourierPrime_400Regular } from "@expo-google-fonts/courier-prime/400Regular";
import { ArchitectsDaughter_400Regular } from "@expo-google-fonts/architects-daughter/400Regular";
import { IndieFlower_400Regular } from "@expo-google-fonts/indie-flower/400Regular";
import { Kalam_400Regular } from "@expo-google-fonts/kalam/400Regular";
import { Kalam_700Bold } from "@expo-google-fonts/kalam/700Bold";
import { PatrickHand_400Regular } from "@expo-google-fonts/patrick-hand/400Regular";
import { ShantellSans_400Regular } from "@expo-google-fonts/shantell-sans/400Regular";
import { ShantellSans_700Bold } from "@expo-google-fonts/shantell-sans/700Bold";

export interface FontSet {
  label: string;
  description: string;
  regular: string; // fontFamily names (the keys of `assets`)
  bold: string; // same as regular for single-weight fonts
  assets: Record<string, number>;
  scale: number; // evens out how large each font looks at the same size
  lineHeight: number; // line height as a multiple of font size, so glyphs aren't clipped
}

export const fontSets = {
  patrickHand: {
    label: "Patrick Hand",
    description: "Neat and calm",
    regular: "PatrickHand_400Regular",
    bold: "PatrickHand_400Regular",
    assets: { PatrickHand_400Regular },
    scale: 1.1,
    lineHeight: 1.35,
  },
  shantellSans: {
    label: "Shantell Sans",
    description: "Clear, friendly marker",
    regular: "ShantellSans_400Regular",
    bold: "ShantellSans_700Bold",
    assets: { ShantellSans_400Regular, ShantellSans_700Bold },
    scale: 0.92,
    lineHeight: 1.4,
  },
  kalam: {
    label: "Kalam",
    description: "Quick, slanted pen",
    regular: "Kalam_400Regular",
    bold: "Kalam_700Bold",
    assets: { Kalam_400Regular, Kalam_700Bold },
    scale: 1,
    lineHeight: 1.45,
  },
  indieFlower: {
    label: "Indie Flower",
    description: "Round and bubbly",
    regular: "IndieFlower_400Regular",
    bold: "IndieFlower_400Regular",
    assets: { IndieFlower_400Regular },
    scale: 1.05,
    lineHeight: 1.45,
  },
  architectsDaughter: {
    label: "Architects Daughter",
    description: "Tidy drafting letters",
    regular: "ArchitectsDaughter_400Regular",
    bold: "ArchitectsDaughter_400Regular",
    assets: { ArchitectsDaughter_400Regular },
    scale: 0.95,
    lineHeight: 1.5,
  },
} as const satisfies Record<string, FontSet>;

export type FontName = keyof typeof fontSets;

/**
 * Typewriter font for printed-style text (dates, stats, descriptions, typed input).
 * Fixed - it doesn't change with the handwriting setting.
 */
export const typewriterFont = {
  regular: "CourierPrime_400Regular",
  assets: { CourierPrime_400Regular },
  scale: 0.94, // monospace runs wide; slightly smaller keeps line lengths similar
  lineHeight: 1.4,
};

export const fontNames = Object.keys(fontSets) as FontName[];
