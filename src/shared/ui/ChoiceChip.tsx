// src/shared/ui/ChoiceChip.tsx
import { createStyles, stroke, useTheme } from "@/shared/theme";
import { Pressable } from "react-native";
import { NoteText } from "./NoteText";
import { SketchBox } from "./SketchBox";

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/** A small hand-outlined option; the selected one is circled in pen and highlighted. */
export const ChoiceChip = ({ label, selected, onPress, disabled }: ChoiceChipProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => (pressed || disabled) && styles.faded}
    >
      <SketchBox
        seed={label}
        stroke={selected ? theme.colors.primary : theme.colors.inkMuted}
        strokeWidth={selected ? stroke.bold : stroke.thin}
        fill={selected ? theme.colors.highlight : undefined}
        style={styles.chip}
      >
        <NoteText variant={selected ? "button" : "label"} color={selected ? "primary" : "inkMuted"}>
          {label}
        </NoteText>
      </SketchBox>
    </Pressable>
  );
};

const useStyles = createStyles((t) => ({
  chip: { paddingVertical: t.spacing.xs + 2, paddingHorizontal: t.spacing.md },
  faded: { opacity: 0.55 },
}));
