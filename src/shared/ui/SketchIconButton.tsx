// src/shared/ui/SketchIconButton.tsx
import { Feather } from "@expo/vector-icons";
import { ThemeColor, useTheme } from "@/shared/theme";
import { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { SketchBox } from "./SketchBox";
import { SketchCircle } from "./SketchCircle";

interface SketchIconButtonProps {
  icon: ComponentProps<typeof Feather>["name"];
  onPress: () => void;
  accessibilityLabel: string;
  color?: ThemeColor;
  shape?: "square" | "circle" | "none";
  filled?: boolean; // light wash of the button's own colour
  size?: number;
  disabled?: boolean;
}

/** An icon inside a hand-drawn square or circle (or bare, for small inline actions). */
export const SketchIconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  color = "ink",
  shape = "square",
  filled = false,
  size = 38,
  disabled,
}: SketchIconButtonProps) => {
  const theme = useTheme();
  const ink = theme.colors[color];
  const fill = filled ? ink + "26" : undefined; // ~15% opacity tint
  const glyph = <Feather name={icon} size={shape === "none" ? 18 : size * 0.45} color={ink} />;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => (pressed || disabled) && { opacity: 0.55 }}
    >
      {shape === "circle" ? (
        <SketchCircle size={size} stroke={ink} fill={fill} seed={`${icon}-${color}`}>
          {glyph}
        </SketchCircle>
      ) : shape === "square" ? (
        <SketchBox seed={`${icon}-${color}`} stroke={ink} fill={fill} style={{ width: size, height: size }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>{glyph}</View>
        </SketchBox>
      ) : (
        <View style={{ padding: 4 }}>{glyph}</View>
      )}
    </Pressable>
  );
};
