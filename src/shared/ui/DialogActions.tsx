// src/shared/ui/DialogActions.tsx
import { createStyles } from "@/shared/theme";
import { View } from "react-native";
import { SketchButton } from "./SketchButton";

interface DialogActionsProps {
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

/** Cancel / confirm button pair used at the bottom of dialogs and sheets. */
export const DialogActions = ({
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
  loading,
  disabled,
}: DialogActionsProps) => {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      <SketchButton title="Cancel" variant="secondary" onPress={onCancel} style={styles.button} />
      <SketchButton
        title={confirmLabel}
        variant={destructive ? "danger" : "primary"}
        onPress={onConfirm}
        loading={loading}
        disabled={disabled}
        style={styles.button}
      />
    </View>
  );
};

const useStyles = createStyles((t) => ({
  row: { flexDirection: "row", gap: t.spacing.md, marginTop: t.spacing.sm },
  button: { flex: 1 },
}));
