// src/features/auth/CodeInput.tsx
import { LinedInput } from "@/shared/ui";
import { createStyles } from "@/shared/theme";
import { ComponentProps } from "react";
import { CODE_LENGTH } from "./validation";

type CodeInputProps = Omit<ComponentProps<typeof LinedInput>, "onChangeText"> & {
  onChangeText: (code: string) => void;
};

/** Confirmation code field: upper-cased, fixed length, spaced out for readability. */
export const CodeInput = ({ onChangeText, style, ...props }: CodeInputProps) => {
  const styles = useStyles();

  return (
    <LinedInput
      placeholder="XXXXXX"
      autoCapitalize="characters"
      autoCorrect={false}
      maxLength={CODE_LENGTH}
      {...props}
      onChangeText={(text) => onChangeText(text.toUpperCase())}
      style={[styles.code, style]}
    />
  );
};

const useStyles = createStyles(() => ({
  code: { fontSize: 24, letterSpacing: 6, textAlign: "center" },
}));
