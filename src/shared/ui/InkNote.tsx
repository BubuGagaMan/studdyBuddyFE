// src/shared/ui/InkNote.tsx
import { Feather } from "@expo/vector-icons";
import { ThemeColor, createStyles, useTheme } from "@/shared/theme";
import { View } from "react-native";
import { NoteText } from "./NoteText";

type Tone = "error" | "success" | "info";

interface InkNoteProps {
  tone?: Tone;
  children: string;
}

const toneStyle: Record<Tone, { color: ThemeColor; icon: "alert-circle" | "check" | "edit-3" }> = {
  error: { color: "danger", icon: "alert-circle" },
  success: { color: "success", icon: "check" },
  info: { color: "inkMuted", icon: "edit-3" },
};

/**
 * Inline form feedback, written like a note in the margin.
 * Used instead of Alert.alert, which does nothing on react-native-web.
 */
export const InkNote = ({ tone = "info", children }: InkNoteProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const { color, icon } = toneStyle[tone];

  return (
    <View style={styles.row} accessibilityRole="alert">
      <Feather name={icon} size={16} color={theme.colors[color]} style={styles.icon} />
      <NoteText variant="note" color={color} style={styles.text}>
        {children}
      </NoteText>
    </View>
  );
};

const useStyles = createStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: t.spacing.sm,
    marginVertical: t.spacing.sm,
  },
  icon: { marginTop: 3 },
  text: { flex: 1 },
}));
