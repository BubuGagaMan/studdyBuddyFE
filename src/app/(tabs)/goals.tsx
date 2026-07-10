import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
        <Text style={styles.subtitle}>Track your long-term milestones</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholderText}>Goals feature coming soon!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.textMain },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 16,
    fontStyle: "italic",
  },
});
