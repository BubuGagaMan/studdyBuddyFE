// src/shared/theme/inks.ts
// An ink set is the "pen" the notebook is written with: text, accents and the printed rules.

export interface InkSet {
  label: string;
  description: string;
  ink: string; // main text
  inkMuted: string; // pencil notes, hints
  primary: string; // actions and links
  danger: string;
  success: string;
  rule: string; // ruled page lines
  margin: string; // vertical margin line
}

export const inks = {
  ballpoint: {
    label: "Ballpoint",
    description: "Blue pen with a red margin",
    ink: "#1F2A44",
    inkMuted: "#5B6478",
    primary: "#2B4C8C",
    danger: "#B23A3A",
    success: "#3F7A4F",
    rule: "#C9D5E2",
    margin: "#E2A19A",
  },
  graphite: {
    label: "Graphite",
    description: "Soft pencil with terracotta",
    ink: "#2E2C2A",
    inkMuted: "#6E6A64",
    primary: "#9A5236",
    danger: "#A0412D",
    success: "#5E7552",
    rule: "#DCD2C3",
    margin: "#D6A58C",
  },
  sepia: {
    label: "Sepia",
    description: "Fountain pen brown with rust",
    ink: "#3B2A1E",
    inkMuted: "#7A6352",
    primary: "#7A3E1D",
    danger: "#9C2F22",
    success: "#5F6B2E",
    rule: "#DCC8AE",
    margin: "#CF9E86",
  },
} as const satisfies Record<string, InkSet>;

export type InkName = keyof typeof inks;

export const inkNames = Object.keys(inks) as InkName[];
