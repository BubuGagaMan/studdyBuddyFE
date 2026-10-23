// src/shared/ui/navigation/TabBarPaper.tsx
import { SketchLine } from "@/shared/ui";
import { createStyles, useTheme } from "@/shared/theme";
import { View } from "react-native";

/** Tab bar background: a strip of darker paper torn off along a hand-drawn edge. */
export const TabBarPaper = () => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.paper}>
      <SketchLine seed="tab-bar" color={theme.colors.inkMuted} style={styles.edge} />
    </View>
  );
};

const useStyles = createStyles((t) => ({
  paper: { flex: 1, backgroundColor: t.colors.surface },
  edge: { marginTop: -4 },
}));
