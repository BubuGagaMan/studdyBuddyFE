// src/app/checklist/[id].tsx
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddListItemButton } from "../../components/AddListItemButton";
import { ChecklistItemRenderer } from "../../components/ChecklistItemRenderer";
import { colors } from "../../constants/colors";
import {
  useChecklistItems,
  useCreateItem,
  useDeleteItem,
  useUpdateItem,
  useUpdateItemEntry,
} from "../../hooks/useChecklistItems";
import { useChecklist } from "../../hooks/useChecklists";
import { ChecklistItemType } from "../../types";

const UNITS = ["hours", "days", "weeks", "months"] as const;

const ITEM_TYPES = [
  {
    id: "boolean",
    label: "Checkbox",
    tooltip: "Set an item as completed or not",
  },
  {
    id: "count_target",
    label: "Target Counter",
    tooltip: "Keep a count out of a specified target",
  },
  {
    id: "count_continuous",
    label: "Counter",
    tooltip: "Non-specific endless counter",
  },
  {
    id: "target_time",
    label: "Target Time",
    tooltip: "Keep a track of time, out of a specified target",
  },
  {
    id: "simple_time",
    label: "Stopwatch",
    tooltip: "Track continuous elapsed time without a target",
  },
  {
    id: "number_range",
    label: "Numeric Range",
    tooltip: "Single number selection out of a specified range",
  },
  {
    id: "categorical",
    label: "Categorical",
    tooltip: "Select one of your specified categories",
  },
];

const getMockItem = (typeId: string) => {
  const base = {
    id: `mock_${typeId}`,
    type: typeId,
    entries: [] as any[],
    settings: {},
    name: "",
  };
  if (typeId === "boolean") {
    base.name = "Took my medicine";
    base.entries = [{ completed: true, timeframeKey: "mock" }];
  } else if (typeId === "count_target") {
    base.name = "Daily veggies";
    base.settings = { target: 5 };
    base.entries = [{ current: 2, timeframeKey: "mock" }];
  } else if (typeId === "count_continuous") {
    base.name = "People I saw today";
    base.entries = [{ current: 7, timeframeKey: "mock" }];
  } else if (typeId === "target_time") {
    base.name = "Time to run a mile";
    base.settings = { target: 480 };
    base.entries = [{ current: 123, timeframeKey: "mock" }];
  } else if (typeId === "simple_time") {
    base.name = "Time spent reading";
    base.entries = [{ durationSeconds: 2712, timeframeKey: "mock" }];
  } else if (typeId === "number_range") {
    base.name = "Rate daily mood";
    base.settings = { rangeLowerBound: 1, rangeUpperBound: 10 };
    base.entries = [{ selectedNumber: 7, timeframeKey: "mock" }];
  } else if (typeId === "categorical") {
    base.name = "Exam result";
    base.settings = { categories: ["A", "B", "C", "D"] };
    base.entries = [{ selectedCategory: "A", timeframeKey: "mock" }];
  }
  return base as any;
};

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: checklist, isLoading: isLoadingChecklist } = useChecklist(id);
  const {
    data: items,
    isLoading: isLoadingItems,
    isError,
  } = useChecklistItems(id);

  const { mutate: updateEntry } = useUpdateItemEntry(id);
  const { mutate: createItem, isPending: isCreating } = useCreateItem(id);
  const { mutate: deleteItem } = useDeleteItem(id);
  const { mutate: updateItem, isPending: isUpdatingItem } = useUpdateItem(id);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<ChecklistItemType>("boolean");

  const [targetNum, setTargetNum] = useState("5");
  const [targetMins, setTargetMins] = useState("30");
  const [rangeLower, setRangeLower] = useState("1");
  const [rangeUpper, setRangeUpper] = useState("10");

  const [categories, setCategories] = useState<string[]>([""]);

  const [intervalValue, setIntervalValue] = useState("1");
  const [intervalUnit, setIntervalUnit] =
    useState<(typeof UNITS)[number]>("days");

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [itemToRename, setItemToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleUpdate = (itemId: string, payload: any) =>
    updateEntry({ itemId, payload });

  const openRenameItemModal = (itemId: string, itemName: string) => {
    setItemToRename({ id: itemId, name: itemName });
    setRenameValue(itemName);
    setRenameModalVisible(true);
  };

  const confirmDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert("Whoops", `Are you sure you want to delete "${itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteItem(itemId),
      },
    ]);
  };

  const handleRenameItem = () => {
    if (!renameValue.trim() || !itemToRename) return;
    updateItem(
      { itemId: itemToRename.id, payload: { name: renameValue } },
      {
        onSuccess: () => {
          setRenameModalVisible(false);
          setItemToRename(null);
        },
      },
    );
  };

  const normalizedCats = categories.map((c) => c.trim().toLowerCase());
  const hasDuplicateCategories = normalizedCats.some(
    (cat, i) => cat !== "" && normalizedCats.indexOf(cat) !== i,
  );

  const handleCreateItem = () => {
    if (!newItemName.trim())
      return Alert.alert("Whoops", "Please enter a name.");

    let settings: any = {};
    if (newItemType === "count_target") {
      if (isNaN(Number(targetNum)))
        return Alert.alert("Whoops", "Target must be a whole number.");
      settings = { target: Number(targetNum) };
    } else if (newItemType === "target_time") {
      if (isNaN(Number(targetMins)))
        return Alert.alert("Whoops", "Time must be a whole number.");
      settings = { target: Number(targetMins) * 60 };
    } else if (newItemType === "number_range") {
      if (isNaN(Number(rangeLower)) || isNaN(Number(rangeUpper)))
        return Alert.alert("Whoops", "Bounds must be whole numbers.");
      if (Number(rangeLower) >= Number(rangeUpper))
        return Alert.alert(
          "Whoops",
          "Upper bound must be greater than lower bound.",
        );
      settings = {
        rangeLowerBound: Number(rangeLower),
        rangeUpperBound: Number(rangeUpper),
      };
    } else if (newItemType === "categorical") {
      const cats = categories.map((c) => c.trim()).filter((c) => c.length > 0);
      if (cats.length < 2)
        return Alert.alert("Whoops", "Provide at least two valid categories.");
      if (hasDuplicateCategories)
        return Alert.alert("Whoops", "Remove duplicate categories.");
      settings = { categories: cats };
    }

    if (
      checklist?.isPerItem &&
      (isNaN(Number(intervalValue)) || Number(intervalValue) < 1)
    ) {
      return Alert.alert(
        "Whoops",
        "Please enter a valid whole number for the reset interval.",
      );
    }

    createItem(
      {
        name: newItemName,
        type: newItemType,
        settings,
        customInterval: checklist?.isPerItem
          ? { value: Number(intervalValue), unit: intervalUnit }
          : undefined,
      },
      {
        onSuccess: () => {
          setCreateModalVisible(false);
          setNewItemName("");
          setNewItemType("boolean");
          setTargetNum("5");
          setTargetMins("30");
          setIntervalValue("1");
          setCategories([""]);
        },
        onError: (err: any) =>
          Alert.alert(
            "Whoops",
            err.response?.data?.message || "Failed to create item",
          ),
      },
    );
  };

  if (isLoadingItems || isLoadingChecklist) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load items.</Text>
      </View>
    );
  }

  const renderSettingsInputs = () => {
    switch (newItemType) {
      case "count_target":
        return (
          <View style={styles.sectionBottom}>
            <Text style={styles.label}>Target Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={targetNum}
              onChangeText={(val) => setTargetNum(val.replace(/[^0-9]/g, ""))}
            />
          </View>
        );
      case "target_time":
        return (
          <View style={styles.sectionBottom}>
            <Text style={styles.label}>Target Time (Minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={targetMins}
              onChangeText={(val) => setTargetMins(val.replace(/[^0-9]/g, ""))}
            />
          </View>
        );
      case "number_range":
        return (
          <View style={styles.sectionBottom}>
            <Text style={styles.label}>Allowed Range Bounds</Text>
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Min"
                keyboardType="number-pad"
                value={rangeLower}
                onChangeText={(val) =>
                  setRangeLower(
                    val.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, ""),
                  )
                }
              />
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Max"
                keyboardType="number-pad"
                value={rangeUpper}
                onChangeText={(val) =>
                  setRangeUpper(
                    val.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, ""),
                  )
                }
              />
            </View>
          </View>
        );
      case "categorical":
        return (
          <View style={[styles.sectionBottom, { maxHeight: 180 }]}>
            <Text style={styles.label}>Categories</Text>
            <ScrollView
              style={{ flexGrow: 0 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.categoryListBuilder}>
                <TouchableOpacity
                  style={styles.addCategoryBtn}
                  onPress={() => setCategories(["", ...categories])}
                >
                  <Feather name="plus" size={14} color={colors.primary} />
                  <Text style={styles.addCategoryText}>Add Category</Text>
                </TouchableOpacity>

                {categories.map((cat, i) => {
                  const currentCatNorm = cat.trim().toLowerCase();
                  const isDup =
                    currentCatNorm !== "" &&
                    normalizedCats.filter((c) => c === currentCatNorm).length >
                      1;

                  return (
                    <View key={i} style={{ marginBottom: isDup ? 6 : 0 }}>
                      <View style={styles.categoryInputRow}>
                        <TextInput
                          style={[
                            styles.input,
                            styles.categoryInput,
                            isDup && styles.inputError,
                          ]}
                          value={cat}
                          onChangeText={(val) => {
                            const newCats = [...categories];
                            newCats[i] = val;
                            setCategories(newCats);
                          }}
                          placeholder={`Category ${i + 1}`}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setCategories(
                              categories.filter((_, idx) => idx !== i),
                            )
                          }
                          style={styles.removeCatBtn}
                        >
                          <Feather
                            name="minus"
                            size={16}
                            color={colors.danger}
                          />
                        </TouchableOpacity>
                      </View>
                      {isDup && (
                        <Text style={styles.duplicateErrorText}>
                          Cannot create duplicate category
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              {checklist?.name || "Items"}
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.headerActionRow}>
          <AddListItemButton
            title="New Item"
            onPress={() => setCreateModalVisible(true)}
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No items yet. Add one!</Text>
        }
        renderItem={({ item }) => (
          <ChecklistItemRenderer
            item={item}
            onUpdate={handleUpdate}
            onEdit={openRenameItemModal}
            onDelete={confirmDeleteItem}
          />
        )}
      />

      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.fullScreenModal} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalInner}>
              <View style={styles.modalHeaderFixed}>
                <Text style={styles.modalTitle}>New Tracking Item</Text>
              </View>

              <ScrollView
                style={styles.typesScrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.centeredLabel}>Select Item Type</Text>
                <View style={styles.typeListContainer}>
                  {ITEM_TYPES.map((t) => {
                    const isActive = newItemType === t.id;
                    return (
                      <View
                        key={t.id}
                        style={[
                          styles.typeCard,
                          isActive && styles.typeCardActive,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.typeCardHeaderWrapper}
                          onPress={() =>
                            setNewItemType(t.id as ChecklistItemType)
                          }
                          activeOpacity={0.7}
                        >
                          <View style={styles.typeCardHeader}>
                            <Text
                              style={[
                                styles.typeCardLabel,
                                isActive && styles.typeCardLabelActive,
                              ]}
                            >
                              {t.label}
                            </Text>
                          </View>
                          <Text style={styles.typeCardTooltip}>
                            {t.tooltip}
                          </Text>
                        </TouchableOpacity>

                        {isActive && (
                          <View style={styles.exampleContainer}>
                            <Text style={styles.exampleHeader}>Example</Text>
                            <View style={styles.mockRendererWrapper}>
                              <ChecklistItemRenderer
                                item={getMockItem(t.id)}
                                onUpdate={() => {}}
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.fixedBottomSection}>
                <View style={styles.sectionBottom}>
                  <Text style={styles.label}>Item Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Drink Water"
                    value={newItemName}
                    onChangeText={setNewItemName}
                  />
                </View>

                {renderSettingsInputs()}

                {checklist?.isPerItem && (
                  <View style={styles.intervalSection}>
                    <Text style={styles.label}>Resets Every:</Text>
                    <View style={styles.intervalRow}>
                      <TextInput
                        style={[
                          styles.input,
                          { flex: 0.3, textAlign: "center" },
                        ]}
                        keyboardType="number-pad"
                        value={intervalValue}
                        onChangeText={(val) =>
                          setIntervalValue(val.replace(/[^0-9]/g, ""))
                        }
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
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setCreateModalVisible(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCreateItem}
                    disabled={
                      isCreating ||
                      (newItemType === "categorical" && hasDuplicateCategories)
                    }
                    style={[
                      styles.saveBtn,
                      (isCreating ||
                        (newItemType === "categorical" &&
                          hasDuplicateCategories)) && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={styles.saveText}>
                      {isCreating ? "Creating..." : "Create Item"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={renameModalVisible}
        animationType="fade"
        transparent={true}
      >
        <TouchableOpacity
          style={styles.modalOverlayCenter}
          activeOpacity={1}
          onPressOut={() => setRenameModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modalContentCenter}
          >
            <Text style={styles.modalTitle}>Rename Item</Text>
            <TextInput
              style={styles.input}
              value={renameValue}
              onChangeText={setRenameValue}
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
                onPress={handleRenameItem}
                disabled={isUpdatingItem}
                style={styles.saveBtn}
              >
                <Text style={styles.saveText}>
                  {isUpdatingItem ? "Saving..." : "Save"}
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
  errorText: { color: colors.danger, fontSize: 16 },

  header: {
    paddingTop: 45,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerActionRow: { paddingHorizontal: 16, paddingBottom: 6 },
  headerLeft: { flex: 1, alignItems: "flex-start" },
  headerCenter: { flex: 3, alignItems: "center" },
  headerRight: { flex: 1, alignItems: "flex-end" },

  backBtn: { paddingRight: 10 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textMain,
    textAlign: "center",
  },

  list: { padding: 12, paddingBottom: 120 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },

  fullScreenModal: { flex: 1, backgroundColor: colors.surface },
  modalInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },

  modalHeaderFixed: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: colors.textMain,
  },
  typesScrollView: { flex: 1 },
  fixedBottomSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 10,
  },
  sectionBottom: { marginBottom: 10 },

  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContentCenter: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  centeredLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.inputBg,
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + "0A",
  },
  duplicateErrorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  rowInputs: { flexDirection: "row", gap: 8 },

  categoryListBuilder: { gap: 6 },
  categoryInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryInput: { flex: 1 },
  removeCatBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.danger + "15",
  },
  addCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    marginBottom: 6,
  },
  addCategoryText: { color: colors.primary, fontSize: 13, fontWeight: "700" },

  typeListContainer: { flexDirection: "column", gap: 8, paddingBottom: 10 },
  typeCard: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceActive,
  },
  typeCardHeaderWrapper: { paddingBottom: 4 },

  typeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeCardLabel: { fontSize: 15, fontWeight: "600", color: colors.textMain },
  typeCardLabelActive: { color: colors.primary, fontWeight: "700" },
  typeCardTooltip: { fontSize: 12, color: colors.textMuted, lineHeight: 16 },

  exampleContainer: { marginTop: 6 },
  exampleHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mockRendererWrapper: { pointerEvents: "auto", marginTop: 4 },

  intervalSection: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intervalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  unitContainer: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  unitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  unitBtnActive: { backgroundColor: colors.primary },
  unitText: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  unitTextActive: { color: colors.surface, fontWeight: "bold" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 6,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: "center",
  },
  cancelText: { color: colors.textMuted, fontWeight: "600", fontSize: 14 },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveText: { color: colors.surface, fontWeight: "bold", fontSize: 14 },
});
