// src/app/(tabs)/index.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AddListItemButton } from "../../components/AddListItemButton";
import { colors } from "../../constants/colors";
import { useChecklistItems } from "../../hooks/useChecklistItems";
import {
  useChecklists,
  useDeleteChecklist,
  useUpdateChecklist,
} from "../../hooks/useChecklists";
import {
  Checklist,
  ChecklistItem,
  CountTargetSettings,
  TargetTimeSettings,
} from "../../types";

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const getNextResetText = (val: number | string, unit: string) => {
  if (!val || !unit) return null;

  const numVal = parseInt(val.toString(), 10);
  if (isNaN(numVal) || numVal < 1) return null;

  const now = new Date();
  const next = new Date(now);

  if (unit === "hours") {
    const nextHour = Math.floor(now.getHours() / numVal) * numVal + numVal;
    next.setHours(nextHour, 0, 0, 0);
  } else if (unit === "days") {
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (now.getTime() - startOfYear.getTime()) / 86400000,
    );
    const nextDayOfYear =
      Math.floor((dayOfYear - 1) / numVal) * numVal + numVal + 1;
    next.setMonth(0, nextDayOfYear);
    next.setHours(0, 0, 0, 0);
  } else if (unit === "weeks") {
    const day = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - day + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    next.setTime(startOfWeek.getTime() + numVal * 7 * 86400000);
  } else if (unit === "months") {
    const nextMonth = Math.floor(now.getMonth() / numVal) * numVal + numVal;
    next.setMonth(nextMonth, 1);
    next.setHours(0, 0, 0, 0);
  }

  const isToday = next.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = next.toDateString() === tomorrow.toDateString();

  const hh = next.getHours().toString().padStart(2, "0");
  const mm = next.getMinutes().toString().padStart(2, "0");
  const time = `${hh}:${mm}`;

  let dateStr = "";
  if (isToday) dateStr = "Today";
  else if (isTomorrow) dateStr = "Tomorrow";
  else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    dateStr = `${months[next.getMonth()]} ${next.getDate()}`;
  }

  const displayUnit = numVal === 1 ? unit.replace(/s$/, "") : unit;
  return {
    interval: `Resets every ${numVal} ${displayUnit}`,
    next: `Next: ${dateStr} at ${time}`,
  };
};

const getChecklistResetText = (checklist: Checklist) => {
  if (checklist.isPerItem)
    return { interval: "Custom Item Intervals", next: null };
  return getNextResetText(
    checklist.resetIntervalValue || 1,
    checklist.resetIntervalUnit || "days",
  );
};

const extractCurrentEntry = (item: any) => {
  if (item.entries && item.entries.length > 0) return item.entries[0];
  switch (item.type) {
    case "boolean":
      return item.booleanEntries?.[0];
    case "count_target":
      return item.countTargetEntries?.[0];
    case "count_continuous":
      return item.countContinuousEntries?.[0];
    case "simple_time":
      return item.simpleTimeEntries?.[0];
    case "target_time":
      return item.targetTimeEntries?.[0];
    case "categorical":
      return item.categoricalEntries?.[0];
    case "number_range":
      return item.numberRangeEntries?.[0];
    default:
      return undefined;
  }
};

const PreviewItem = ({ item }: { item: ChecklistItem & any }) => {
  const currentEntry = extractCurrentEntry(item);

  const dbCompleted = currentEntry?.completed || false;
  const dbCurrent = currentEntry?.current || 0;
  const dbDuration =
    currentEntry?.durationSeconds ?? currentEntry?.durationSecons ?? 0;
  const dbCategory = currentEntry?.selectedCategory;
  const dbRangeNum = currentEntry?.selectedNumber;

  let valueText = "";
  let isDone = false;

  if (item.type === "boolean") {
    isDone = dbCompleted;
    valueText = dbCompleted ? "Done" : "Pending";
  } else if (item.type === "count_target") {
    const target = (item.settings as CountTargetSettings)?.target || 0;
    isDone = dbCurrent >= target;
    valueText = `${dbCurrent} / ${target}`;
  } else if (item.type === "count_continuous") {
    isDone = dbCurrent > 0;
    valueText = `${dbCurrent}`;
  } else if (item.type === "simple_time") {
    isDone = dbDuration > 0;
    valueText = formatTime(dbDuration);
  } else if (item.type === "target_time") {
    const target = (item.settings as TargetTimeSettings)?.target || 0;
    isDone = dbCurrent >= target;
    valueText = `${formatTime(dbCurrent)} / ${formatTime(target)}`;
  } else if (item.type === "number_range") {
    isDone = dbRangeNum !== undefined;
    valueText = dbRangeNum !== undefined ? `${dbRangeNum}` : "-";
  } else if (item.type === "categorical") {
    isDone = !!dbCategory;
    valueText = dbCategory || "-";
  }

  return (
    <View style={styles.previewRow}>
      <View style={styles.previewNameContainer}>
        <Feather
          name={isDone ? "check-circle" : "circle"}
          size={14}
          color={isDone ? colors.successSolid : colors.textMuted}
          style={{ opacity: 0.8, marginRight: 8 }}
        />
        <Text
          style={[styles.previewName, isDone && styles.previewNameDone]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </View>
      <Text
        style={[styles.previewValue, isDone && { color: colors.successSolid }]}
      >
        {valueText}
      </Text>
    </View>
  );
};

const ChecklistCard = ({
  checklist,
  onPress,
  onRename,
  onDelete,
}: {
  checklist: Checklist;
  onPress: () => void;
  onRename: () => void;
  onDelete: () => void;
}) => {
  const { data: items } = useChecklistItems(checklist.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const isEmpty = (items?.length || 0) === 0;

  const resetInfo = getChecklistResetText(checklist);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleContainer}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{checklist.name}</Text>
              <TouchableOpacity
                onPress={onRename}
                style={styles.iconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="edit-2" size={16} color={colors.iconDefault} />
              </TouchableOpacity>
            </View>

            {resetInfo && (
              <View style={styles.resetContainer}>
                <Text style={styles.intervalText}>{resetInfo.interval}</Text>
                {resetInfo.next && (
                  <Text style={styles.nextResetText}>{resetInfo.next}</Text>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onPress}
            style={styles.seeItemsBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.seeItemsText}>See Items</Text>
            <Feather name="arrow-right" size={14} color={colors.surface} />
          </TouchableOpacity>
        </View>

        {isExpanded && !isEmpty && (
          <View style={styles.previewContainer}>
            <View style={styles.previewDivider} />
            <Text style={styles.previewHeader}>Tasks Overview:</Text>
            {items &&
              items.length > 0 &&
              items.map((item) => <PreviewItem key={item.id} item={item} />)}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <View style={styles.leftActions}>
          {isEmpty ? null : (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.previewToggleBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.previewToggleText}>
                {isExpanded ? "Close" : "Preview"}
              </Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={14} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { data: checklists, isLoading, isError, refetch } = useChecklists();
  const { mutate: deleteChecklist } = useDeleteChecklist();
  const { mutate: updateChecklist, isPending: isUpdating } =
    useUpdateChecklist();

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [listToRename, setListToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newListName, setNewListName] = useState("");

  const openRenameModal = (id: string, name: string) => {
    setListToRename({ id, name });
    setNewListName(name);
    setRenameModalVisible(true);
  };

  const confirmDeleteList = (id: string, name: string) => {
    Alert.alert(
      "Whoops",
      `Are you sure you want to delete "${name}"? All items inside will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteChecklist(id),
        },
      ],
    );
  };

  const handleRename = () => {
    if (!newListName.trim() || !listToRename) return;
    updateChecklist(
      { id: listToRename.id, payload: { name: newListName } },
      {
        onSuccess: () => {
          setRenameModalVisible(false);
          setListToRename(null);
        },
      },
    );
  };

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  if (isError)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load checklists.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextRow}>
          <Text style={styles.title}>My Checklists</Text>
          <Text style={styles.headerSubtitle}>
            Tap 'Preview' to see your progress at a glance
          </Text>
        </View>
        <View style={styles.headerActionRow}>
          <AddListItemButton
            title="New List"
            onPress={() => router.push("/checklist/create")}
          />
        </View>
      </View>

      <FlatList
        data={checklists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No checklists found. Create one!</Text>
        }
        renderItem={({ item }) => (
          <ChecklistCard
            checklist={item}
            onPress={() => router.push(`/checklist/${item.id}`)}
            onRename={() => openRenameModal(item.id, item.name)}
            onDelete={() => confirmDeleteList(item.id, item.name)}
          />
        )}
      />

      <Modal
        visible={renameModalVisible}
        animationType="fade"
        transparent={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setRenameModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modalContentCenter}
          >
            <Text style={styles.modalTitle}>Rename Checklist</Text>
            <TextInput
              style={styles.input}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setRenameModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRename}
                disabled={isUpdating}
                style={styles.saveBtn}
              >
                <Text style={styles.saveText}>
                  {isUpdating ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 45,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTextRow: { paddingHorizontal: 16, paddingBottom: 10 },
  headerActionRow: { paddingHorizontal: 16, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: "800", color: colors.textMain },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    opacity: 0.9,
  },

  listContainer: { padding: 16, paddingBottom: 120, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: { padding: 16, paddingBottom: 12 },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleContainer: { flex: 1, paddingRight: 10 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  cardTitle: { fontSize: 19, fontWeight: "700", color: colors.textMain },
  iconBtn: { padding: 4 },

  resetContainer: { marginTop: 4, marginBottom: 2 },
  intervalText: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
  nextResetText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },

  seeItemsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  seeItemsText: { color: colors.surface, fontSize: 13, fontWeight: "700" },

  previewContainer: { marginTop: 12, paddingHorizontal: 2 },
  previewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 10,
    opacity: 0.5,
  },
  previewHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMain,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  previewNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  previewName: { fontSize: 15, color: colors.textMain, fontWeight: "500" },
  previewNameDone: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textAlign: "right",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },

  leftActions: { flexDirection: "row", alignItems: "center" },
  previewToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    marginLeft: -4,
  },
  previewToggleText: { color: colors.primary, fontSize: 14, fontWeight: "700" },

  deleteBtn: { padding: 4, marginRight: -4 },

  errorText: { color: colors.danger, fontSize: 16, marginBottom: 10 },
  retryButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: { color: colors.surface },
  emptyText: { textAlign: "center", color: colors.textMuted, marginTop: 40 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContentCenter: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: colors.textMain,
  },
  input: {
    backgroundColor: colors.inputBg,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    alignItems: "center",
  },
  cancelText: { color: colors.textMuted, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveText: { color: colors.surface, fontWeight: "600" },
});
