// src/shared/ui/PaperBackground.tsx
import { useLayoutSize } from "@/shared/hooks/useLayoutSize";
import { createStyles, useTheme } from "@/shared/theme";
import { View } from "react-native";

interface PaperBackgroundProps {
  ruled?: boolean;
  margin?: boolean;
  firstLineOffset?: number; // blank space above the first rule, like a page header
}

/** Fills its parent with notebook paper: printed rules plus a vertical margin line. */
export const PaperBackground = ({
  ruled = true,
  margin = true,
  firstLineOffset = 96,
}: PaperBackgroundProps) => {
  const styles = useStyles();
  const { lineGap } = useTheme().page;
  const { height, onLayout } = useLayoutSize();

  const lineCount = ruled
    ? Math.max(0, Math.ceil((height - firstLineOffset) / lineGap))
    : 0;

  return (
    <View style={styles.paper} onLayout={onLayout} pointerEvents="none">
      <View style={{ paddingTop: firstLineOffset }}>
        {Array.from({ length: lineCount }, (_, i) => (
          <View key={i} style={styles.rule} />
        ))}
      </View>
      {margin && <View style={styles.margin} />}
    </View>
  );
};

const useStyles = createStyles((t) => ({
  paper: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    backgroundColor: t.colors.page,
  },
  rule: {
    height: 1,
    marginBottom: t.page.lineGap - 1,
    backgroundColor: t.colors.rule,
  },
  margin: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: t.page.marginX,
    width: 1.5,
    backgroundColor: t.colors.margin,
  },
}));
