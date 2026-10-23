// src/shared/ui/NumberInput.tsx
import { createStyles, stroke, useTheme } from "@/shared/theme";
import { digitsOnly, numberKeyboard, signedDigitsOnly } from "@/shared/utils/numberText";
import { Ref, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { SketchLine } from "./SketchLine";

interface NumberInputProps extends Omit<TextInputProps, "onChangeText" | "style"> {
  value: string;
  onChangeText: (text: string) => void; // receives the filtered text
  allowNegative?: boolean;
  width?: number;
  ref?: Ref<TextInput>;
}

/**
 * Compact number field for inline controls: handwritten digits on a short pen line that
 * darkens while focused. Filters input to whole numbers as the user types.
 * (Use LinedInput for labelled form fields.)
 */
export const NumberInput = ({
  value,
  onChangeText,
  allowNegative = false,
  width = 52,
  ref,
  onFocus,
  onBlur,
  ...inputProps
}: NumberInputProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  const filter = allowNegative ? signedDigitsOnly : digitsOnly;

  return (
    <View style={{ width }}>
      <TextInput
        ref={ref}
        keyboardType={numberKeyboard(allowNegative)}
        placeholderTextColor={theme.colors.inkMuted}
        selectionColor={theme.colors.primary}
        {...inputProps}
        value={value}
        onChangeText={(text) => onChangeText(filter(text))}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={styles.input}
      />
      <SketchLine
        color={focused ? theme.colors.primary : theme.colors.inkMuted}
        strokeWidth={focused ? stroke.bold : stroke.regular}
      />
    </View>
  );
};

const useStyles = createStyles((t) => ({
  input: {
    fontFamily: t.fonts.handBold,
    fontSize: 20,
    color: t.colors.ink,
    textAlign: "center",
    paddingVertical: 2,
    // no browser focus ring on web - the line itself shows focus
    outlineStyle: "none",
  } as object,
}));
