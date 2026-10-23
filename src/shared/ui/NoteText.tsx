// src/shared/ui/NoteText.tsx
import { TextVariant, ThemeColor, useTheme } from "@/shared/theme";
import { Text, TextProps } from "react-native";

interface NoteTextProps extends TextProps {
  variant?: TextVariant;
  color?: ThemeColor;
  align?: "left" | "center" | "right";
}

const defaultColor: Record<TextVariant, ThemeColor> = {
  title: "ink",
  heading: "ink",
  label: "inkMuted",
  button: "ink",
  note: "inkMuted",
  body: "ink",
  caption: "inkMuted",
};

/** All text in the app goes through here so fonts and ink colours stay consistent. */
export const NoteText = ({
  variant = "body",
  color,
  align,
  style,
  ...textProps
}: NoteTextProps) => {
  const theme = useTheme();

  return (
    <Text
      {...textProps}
      style={[
        theme.text[variant],
        { color: theme.colors[color ?? defaultColor[variant]] },
        align && { textAlign: align },
        style,
      ]}
    />
  );
};
