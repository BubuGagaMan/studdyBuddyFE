// src/shared/ui/PageHeader.tsx
import { createStyles } from "@/shared/theme";
import { View } from "react-native";
import { NoteText } from "./NoteText";
import { SketchLine } from "./SketchLine";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export const PageHeader = ({ title, subtitle, align = "left" }: PageHeaderProps) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, align === "center" && styles.centered]}>
      <View>
        <NoteText variant="title" align={align}>
          {title}
        </NoteText>
        <SketchLine seed={title} style={styles.underline} />
      </View>
      {subtitle && (
        <NoteText variant="note" align={align} style={styles.subtitle}>
          {subtitle}
        </NoteText>
      )}
    </View>
  );
};

const useStyles = createStyles((t) => ({
  // children size to their content, so the underline matches the title width
  container: { marginBottom: t.spacing.lg, alignItems: "flex-start" },
  centered: { alignItems: "center" },
  underline: { marginTop: -t.spacing.xs },
  subtitle: { marginTop: t.spacing.sm },
}));
