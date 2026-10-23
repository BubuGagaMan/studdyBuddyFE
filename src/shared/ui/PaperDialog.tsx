// src/shared/ui/PaperDialog.tsx
import { createStyles, useTheme } from "@/shared/theme";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable } from "react-native";
import { NoteText } from "./NoteText";
import { SketchBox } from "./SketchBox";

interface PaperDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** A centred scrap of paper over a dimmed page. Tapping outside closes it. */
export const PaperDialog = ({ visible, onClose, title, children }: PaperDialogProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Close dialog">
          {/* stop presses on the card from reaching the overlay */}
          <Pressable style={styles.cardWrap} onPress={() => {}}>
            <SketchBox
              seed={title}
              fill={theme.colors.page}
              stroke={theme.colors.ink}
              style={styles.card}
              accessibilityViewIsModal
            >
              <NoteText variant="heading" style={styles.title}>
                {title}
              </NoteText>
              {children}
            </SketchBox>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const useStyles = createStyles((t) => ({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: t.spacing.lg,
    backgroundColor: t.colors.ink + "66",
  },
  cardWrap: { width: "100%", maxWidth: 420 },
  card: { padding: t.spacing.lg },
  title: { marginBottom: t.spacing.md },
}));
