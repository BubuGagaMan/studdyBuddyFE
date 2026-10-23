// src/shared/ui/SketchButton.tsx
import { Feather } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleProp, View, ViewStyle } from "react-native";
import { ThemeColor, createStyles, useTheme } from "@/shared/theme";
import { NoteText } from "./NoteText";
import { SketchBox } from "./SketchBox";
import { SketchLine } from "./SketchLine";

type Variant = "primary" | "secondary" | "danger" | "link";

interface SketchButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Feather>["name"];
  size?: "regular" | "small";
  color?: ThemeColor; // overrides the variant's ink
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const inkFor: Record<Variant, ThemeColor> = {
  primary: "primary",
  secondary: "ink",
  danger: "danger",
  link: "primary",
};

export const SketchButton = ({
  title,
  onPress,
  variant = "primary",
  icon,
  size = "regular",
  color: colorOverride,
  loading = false,
  disabled = false,
  style,
}: SketchButtonProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const color = colorOverride ?? inkFor[variant];
  const inactive = disabled || loading;
  const small = size === "small";

  const label = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={theme.colors[color]} />
      ) : (
        icon && <Feather name={icon} size={small ? 15 : 18} color={theme.colors[color]} />
      )}
      <NoteText variant="button" color={color} style={small && styles.smallText}>
        {title}
      </NoteText>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      hitSlop={variant === "link" ? 8 : undefined}
      style={({ pressed }) => [
        variant === "link" && styles.linkWrap,
        (pressed || inactive) && styles.faded,
        style,
      ]}
    >
      {variant === "link" ? (
        <>
          {label}
          <SketchLine seed={title} color={theme.colors[color]} strokeWidth={1.25} />
        </>
      ) : (
        <SketchBox
          seed={title}
          stroke={theme.colors[color]}
          fill={variant === "primary" ? theme.colors.highlightStrong : undefined}
          style={[styles.box, small && styles.smallBox]}
        >
          {label}
        </SketchBox>
      )}
    </Pressable>
  );
};

const useStyles = createStyles((t) => ({
  box: {
    paddingVertical: t.spacing.md - 2,
    paddingHorizontal: t.spacing.lg,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing.sm,
  },
  smallBox: { paddingVertical: t.spacing.xs + 2, paddingHorizontal: t.spacing.md },
  smallText: { fontSize: 15, lineHeight: 22 },
  linkWrap: { alignSelf: "center" },
  faded: { opacity: 0.55 },
}));
