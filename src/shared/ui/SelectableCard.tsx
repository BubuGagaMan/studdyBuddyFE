// src/shared/ui/SelectableCard.tsx
import { createStyles, stroke, useTheme } from "@/shared/theme";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { SketchBox } from "./SketchBox";
import { SketchTick } from "./SketchTick";

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  seed: string | number;
  accessibilityLabel?: string;
  accentColor?: string; // outline + tick when selected; defaults to the primary ink
  children: ReactNode; // the option's content, laid out in a row
  below?: ReactNode; // extra content under the row, outside the tappable area
}

/**
 * One option in a pick-one list (use inside a View with accessibilityRole="radiogroup").
 * The selected option gets a bold outline, a highlight and a tick.
 */
export const SelectableCard = ({
  selected,
  onSelect,
  seed,
  accessibilityLabel,
  accentColor,
  children,
  below,
}: SelectableCardProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const accent = accentColor ?? theme.colors.primary;

  return (
    <SketchBox
      seed={seed}
      stroke={selected ? accent : theme.colors.inkMuted}
      strokeWidth={selected ? stroke.bold : stroke.thin}
      fill={selected ? theme.colors.highlight : undefined}
      style={styles.box}
    >
      <Pressable
        onPress={onSelect}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.content}>{children}</View>
        {selected && <SketchTick color={accent} seed={`tick-${seed}`} />}
      </Pressable>
      {below}
    </SketchBox>
  );
};

const useStyles = createStyles((t) => ({
  box: { padding: t.spacing.md, marginBottom: t.spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: t.spacing.md },
  content: { flex: 1, flexDirection: "row", alignItems: "center", gap: t.spacing.md },
  pressed: { opacity: 0.7 },
}));
