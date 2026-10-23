// src/shared/theme/layout.ts

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const page = {
  lineGap: 28, // distance between ruled lines
  marginX: 28, // x position of the vertical margin line
  maxWidth: 520, // keeps pages readable on wide web screens
} as const;

export const stroke = {
  thin: 1.25,
  regular: 1.75,
  bold: 2.5,
} as const;
