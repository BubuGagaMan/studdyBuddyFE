// src/shared/theme/theme.ts
import { FontName } from "./fontSets";
import { InkName, inks } from "./inks";
import { page, spacing, stroke } from "./layout";
import { paper } from "./palette";
import { buildFonts, buildTextVariants } from "./typography";

const buildTheme = (inkName: InkName, fontName: FontName) => {
  const ink = inks[inkName];

  return {
    inkName,
    fontName,
    colors: {
      page: paper.cream,
      surface: paper.linen,
      surfaceAlt: paper.sand,
      highlight: paper.blush,
      highlightStrong: paper.tan,
      ink: ink.ink,
      inkMuted: ink.inkMuted,
      primary: ink.primary,
      danger: ink.danger,
      success: ink.success,
      rule: ink.rule,
      margin: ink.margin,
    },
    fonts: buildFonts(fontName),
    text: buildTextVariants(fontName),
    spacing,
    page,
    stroke,
  };
};

export type Theme = ReturnType<typeof buildTheme>;
export type ThemeColor = keyof Theme["colors"];

// One theme object per ink + font combination, built on first use and then reused.
// The identity of each theme object must stay stable - createStyles caches by it.
const cache = new Map<string, Theme>();

export const getTheme = (inkName: InkName, fontName: FontName): Theme => {
  const key = `${inkName}:${fontName}`;
  let theme = cache.get(key);
  if (!theme) {
    theme = buildTheme(inkName, fontName);
    cache.set(key, theme);
  }
  return theme;
};
