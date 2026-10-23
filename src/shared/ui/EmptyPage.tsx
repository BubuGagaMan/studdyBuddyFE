// src/shared/ui/EmptyPage.tsx
import { createStyles } from "@/shared/theme";
import { View } from "react-native";
import { NoteText } from "./NoteText";

interface EmptyPageProps {
  message: string;
}

/** Centred pencil note for pages with nothing on them yet. */
export const EmptyPage = ({ message }: EmptyPageProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <NoteText variant="heading" color="inkMuted" align="center">
        {message}
      </NoteText>
    </View>
  );
};

const useStyles = createStyles(() => ({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
}));
