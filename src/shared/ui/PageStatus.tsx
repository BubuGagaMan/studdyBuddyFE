// src/shared/ui/PageStatus.tsx
import { createStyles, useTheme } from "@/shared/theme";
import { ActivityIndicator, View } from "react-native";
import { NoteText } from "./NoteText";
import { SketchButton } from "./SketchButton";

interface PageStatusProps {
  error?: string;
  onRetry?: () => void;
}

/** Full-page loading spinner, or an error with an optional retry. */
export const PageStatus = ({ error, onRetry }: PageStatusProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <NoteText variant="heading" color="danger" align="center">
            {error}
          </NoteText>
          {onRetry && <SketchButton title="Retry" variant="secondary" onPress={onRetry} />}
        </>
      ) : (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      )}
    </View>
  );
};

const useStyles = createStyles((t) => ({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: t.spacing.lg },
}));
