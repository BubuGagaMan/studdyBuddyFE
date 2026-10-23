// src/shared/ui/NotebookScreen.tsx
import { createStyles } from "@/shared/theme";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperBackground } from "./PaperBackground";

interface NotebookScreenProps {
  children: ReactNode;
  scroll?: boolean; // wrap content in a ScrollView (forms, long pages)
  centered?: boolean; // vertically centre content (auth pages)
}

/** Base page: paper background, safe areas, keyboard handling and a readable max width. */
export const NotebookScreen = ({
  children,
  scroll = false,
  centered = false,
}: NotebookScreenProps) => {
  const styles = useStyles();
  const contentStyle = [styles.content, centered && styles.centered];

  return (
    <View style={styles.root}>
      <PaperBackground />
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={contentStyle}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.root, contentStyle]}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const useStyles = createStyles((t) => ({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: t.page.maxWidth,
    alignSelf: "center",
    paddingTop: t.spacing.lg,
    paddingBottom: t.spacing.xl,
    // keep writing to the right of the margin line
    paddingLeft: t.page.marginX + t.spacing.md,
    paddingRight: t.spacing.lg,
  },
  centered: { justifyContent: "center" },
}));
