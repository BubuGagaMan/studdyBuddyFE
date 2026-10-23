// src/shared/ui/NoteCard.tsx
import { createStyles, useTheme } from "@/shared/theme";
import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { NoteText } from "./NoteText";
import { SketchBox } from "./SketchBox";

interface NoteCardProps {
  title?: string;
  seed?: string | number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A hand-outlined panel on a slightly darker sheet of paper. */
export const NoteCard = ({ title, seed, children, style }: NoteCardProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <SketchBox
      seed={seed ?? title}
      fill={theme.colors.surface}
      stroke={theme.colors.inkMuted}
      style={[styles.card, style]}
    >
      {title && (
        <NoteText variant="heading" style={styles.title}>
          {title}
        </NoteText>
      )}
      {children}
    </SketchBox>
  );
};

const useStyles = createStyles((t) => ({
  card: { padding: t.spacing.md, marginBottom: t.spacing.md },
  title: { marginBottom: t.spacing.sm },
}));
