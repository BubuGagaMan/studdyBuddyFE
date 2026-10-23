// src/shared/ui/LinedInput.tsx
import { createStyles, stroke, useTheme } from "@/shared/theme";
import { Ref, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { NoteText } from "./NoteText";
import { SketchLine } from "./SketchLine";

interface LinedInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  ref?: Ref<TextInput>;
}

/** A text field written on a hand-drawn line instead of inside a box. */
export const LinedInput = ({
  label,
  error,
  ref,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: LinedInputProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  const lineColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.inkMuted;

  return (
    <View style={styles.container}>
      {label && <NoteText variant="label">{label}</NoteText>}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.inkMuted + "99"}
        selectionColor={theme.colors.primary}
        accessibilityLabel={label}
        {...inputProps}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, style]}
      />
      <SketchLine
        seed={label}
        color={lineColor}
        strokeWidth={focused ? stroke.bold : stroke.regular}
      />
      {error && (
        <NoteText variant="note" color="danger">
          {error}
        </NoteText>
      )}
    </View>
  );
};

const useStyles = createStyles((t) => ({
  container: { marginBottom: t.spacing.md },
  input: {
    fontFamily: t.fonts.body,
    fontSize: 16,
    color: t.colors.ink,
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.xs,
    // no browser focus ring on web - the line itself shows focus
    outlineStyle: "none",
  } as object,
}));
