// src/shared/ui/ConfirmDialog.tsx
import { DialogActions } from "./DialogActions";
import { NoteText } from "./NoteText";
import { PaperDialog } from "./PaperDialog";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Cross-platform replacement for Alert.alert confirmations (a no-op on web). */
export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <PaperDialog visible={visible} onClose={onCancel} title={title}>
    <NoteText style={{ marginBottom: 16 }}>{message}</NoteText>
    <DialogActions
      confirmLabel={confirmLabel}
      destructive={destructive}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  </PaperDialog>
);
