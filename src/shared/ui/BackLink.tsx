// src/shared/ui/BackLink.tsx
import { Feather } from "@expo/vector-icons";
import { createStyles, useTheme } from "@/shared/theme";
import { Pressable } from "react-native";
import { NoteText } from "./NoteText";

interface BackLinkProps {
  onPress: () => void;
  label?: string;
}

export const BackLink = ({ onPress, label = "Back" }: BackLinkProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Feather name="arrow-left" size={18} color={theme.colors.primary} />
      <NoteText variant="button" color="primary">
        {label}
      </NoteText>
    </Pressable>
  );
};

const useStyles = createStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.xs,
    alignSelf: "flex-start",
    marginBottom: t.spacing.md,
  },
  pressed: { opacity: 0.55 },
}));
