// src/shared/ui/PromptDialog.tsx
import { useEffect, useState } from "react";
import { DialogActions } from "./DialogActions";
import { InkNote } from "./InkNote";
import { LinedInput } from "./LinedInput";
import { PaperDialog } from "./PaperDialog";

interface PromptDialogProps {
  visible: boolean;
  title: string;
  label?: string;
  initialValue: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

/** A dialog asking for one line of text, e.g. renaming something. */
export const PromptDialog = ({
  visible,
  title,
  label,
  initialValue,
  confirmLabel = "Save",
  loading,
  error,
  onSubmit,
  onCancel,
}: PromptDialogProps) => {
  const [value, setValue] = useState(initialValue);

  // start from the current value each time the dialog opens
  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const submit = () => {
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <PaperDialog visible={visible} onClose={onCancel} title={title}>
      <LinedInput
        label={label}
        value={value}
        onChangeText={setValue}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {error && <InkNote tone="error">{error}</InkNote>}
      <DialogActions
        confirmLabel={confirmLabel}
        onConfirm={submit}
        onCancel={onCancel}
        loading={loading}
        disabled={!value.trim()}
      />
    </PaperDialog>
  );
};
