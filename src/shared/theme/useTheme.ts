// src/shared/theme/useTheme.ts
import { usePreferencesStore } from "./usePreferencesStore";
import { StyleSheet } from "react-native";
import { Theme, getTheme } from "./theme";

export const useTheme = (): Theme => {
  const ink = usePreferencesStore((state) => state.ink);
  const font = usePreferencesStore((state) => state.font);
  return getTheme(ink, font);
};

/**
 * Theme-aware StyleSheet factory. Styles are built once per theme and cached.
 *
 * const useStyles = createStyles((t) => ({ title: { color: t.colors.ink } }));
 * const styles = useStyles();
 */
export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
) => {
  const cache = new WeakMap<Theme, T>();

  return () => {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      cache.set(theme, styles);
    }
    return styles;
  };
};
