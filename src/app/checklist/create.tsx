// src/app/checklist/create.tsx
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../api/client";
import { colors } from "../../constants/colors";

const UNITS = ["hours", "days", "weeks", "months"] as const;

export default function CreateChecklistScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [intervalValue, setIntervalValue] = useState("1");
  const [intervalUnit, setIntervalUnit] =
    useState<(typeof UNITS)[number]>("days");
  const [isPerItem, setIsPerItem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim())
      return Alert.alert("Whoops", "Please enter a checklist name.");
    if (
      !isPerItem &&
      (isNaN(Number(intervalValue)) || Number(intervalValue) < 1)
    ) {
      return Alert.alert(
        "Whoops",
        "Please enter a valid whole number for the global reset interval.",
      );
    }

    setIsSubmitting(true);
    try {
      await api.post("/checklist", {
        name,
        isPerItem,
        resetIntervalValue: isPerItem ? null : Number(intervalValue),
        resetIntervalUnit: isPerItem ? null : intervalUnit,
      });

      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Whoops",
        error.response?.data?.message || "Failed to create checklist",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Checklist</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>Checklist Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning Routine"
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View
            style={[styles.section, isPerItem && { opacity: 0.4 }]}
            pointerEvents={isPerItem ? "none" : "auto"}
          >
            <Text style={styles.label}>List Reset Interval</Text>
            <View style={styles.intervalRow}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 0.3, textAlign: "center", marginBottom: 0 },
                ]}
                keyboardType="number-pad"
                value={intervalValue}
                onChangeText={(val) =>
                  setIntervalValue(val.replace(/[^0-9]/g, ""))
                }
                editable={!isPerItem}
              />
              <View style={styles.unitContainer}>
                {UNITS.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitBtn,
                      intervalUnit === unit && styles.unitBtnActive,
                    ]}
                    onPress={() => setIntervalUnit(unit)}
                    disabled={isPerItem}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        intervalUnit === unit && styles.unitTextActive,
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.tooltipBox}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={styles.tooltipText}>
                This setting will make all items inside this list automatically
                reset their progress together on the selected interval.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 15 }}>
              <Text style={styles.label}>Use Custom Item Intervals</Text>
              <Text style={styles.subtext}>
                Overrides the global list interval, allowing you to set a unique
                reset timer for every single item you add.
              </Text>
            </View>
            <Switch
              value={isPerItem}
              onValueChange={setIsPerItem}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleCreate}
            disabled={isSubmitting}
          >
            <Text style={styles.saveText}>
              {isSubmitting ? "Creating..." : "Create Checklist"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 50 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: colors.textMain },
  content: { padding: 20 },
  section: { marginBottom: 25 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intervalRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  unitContainer: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  unitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitText: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  unitTextActive: { color: colors.surface, fontWeight: "bold" },
  tooltipBox: {
    flexDirection: "row",
    backgroundColor: "#EBF4FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    alignItems: "flex-start",
  },
  tooltipText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 25 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: colors.surface, fontSize: 16, fontWeight: "700" },
});
