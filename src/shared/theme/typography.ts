// src/shared/theme/typography.ts
import { TextStyle } from "react-native";
import { FontName, fontSets, typewriterFont } from "./fontSets";

export type TextVariant =
  | "title"
  | "heading"
  | "label"
  | "button"
  | "note"
  | "body"
  | "caption";

type Role = "display" | "heading" | "hand" | "handBold" | "body";

// size before scaling; "body" uses the typewriter font, every other role the chosen handwriting
const baseVariants: Record<TextVariant, { role: Role; size: number }> = {
  title: { role: "display", size: 32 },
  heading: { role: "heading", size: 22 },
  label: { role: "hand", size: 16 },
  button: { role: "handBold", size: 17 },
  note: { role: "hand", size: 15 },
  body: { role: "body", size: 16 },
  caption: { role: "body", size: 13 },
};

/** fontFamily per role. Each weight is its own family - don't combine with fontWeight. */
export const buildFonts = (fontName: FontName) => {
  const set = fontSets[fontName];
  return {
    display: set.bold, // page titles
    heading: set.regular, // section headings, item names
    hand: set.regular, // labels, notes
    handBold: set.bold, // buttons
    body: typewriterFont.regular, // printed-style text and inputs
  } satisfies Record<Role, string>;
};

/** Text styles for a font set. Colour is applied by NoteText from the active ink. */
export const buildTextVariants = (fontName: FontName): Record<TextVariant, TextStyle> => {
  const set = fontSets[fontName];
  const fonts = buildFonts(fontName);

  return Object.fromEntries(
    Object.entries(baseVariants).map(([variant, { role, size }]) => {
      const metrics = role === "body" ? typewriterFont : set;
      const fontSize = Math.round(size * metrics.scale);
      const lineHeight = Math.round(fontSize * metrics.lineHeight);
      return [variant, { fontFamily: fonts[role], fontSize, lineHeight }];
    }),
  ) as Record<TextVariant, TextStyle>;
};
