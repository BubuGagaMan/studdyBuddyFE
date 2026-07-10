// src/components/ChecklistItemRenderer.tsx
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";
import {
  CategoricalSettings,
  ChecklistItem,
  CountTargetSettings,
  NumberRangeSettings,
  TargetTimeSettings,
} from "../types";

interface Props {
  item: ChecklistItem & any;
  onUpdate: (itemId: string, payload: any) => void;
  onEdit: (itemId: string, name: string) => void;
  onDelete: (itemId: string, name: string) => void;
}

interface FloatingParticle {
  id: string;
  val: number;
  anim: Animated.Value;
  xOffset: number;
}

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

export const ChecklistItemRenderer = ({
  item,
  onUpdate,
  onEdit,
  onDelete,
}: Props) => {
  const currentEntry = extractCurrentEntry(item);

  const dbCompleted = currentEntry?.completed || false;
  const dbCurrent = currentEntry?.current || 0;
  const dbDuration =
    currentEntry?.durationSeconds ?? currentEntry?.durationSecons ?? 0;
  const dbCategory = currentEntry?.selectedCategory;
  const dbRangeNum = currentEntry?.selectedNumber;

  const [optimisticCompleted, setOptimisticCompleted] = useState(dbCompleted);
  const [optimisticCurrent, setOptimisticCurrent] = useState(dbCurrent);
  const [optimisticCategory, setOptimisticCategory] = useState(dbCategory);
  const [optimisticRangeNum, setOptimisticRangeNum] = useState<
    number | undefined
  >(dbRangeNum);

  const baseTime = item.type === "simple_time" ? dbDuration : dbCurrent;
  const [localTime, setLocalTime] = useState(baseTime);
  const [timerActive, setTimerActive] = useState(false);

  const sessionAccumulator = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const prevTimeframe = useRef(currentEntry?.timeframeKey);

  useEffect(() => {
    if (item.id.includes("mock_")) return;

    if (item.type === "target_time" || item.type === "simple_time") {
      SecureStore.getItemAsync(`timer_start_${item.id}`).then((val) => {
        if (val) {
          startTimeRef.current = parseInt(val, 10);
          setTimerActive(true);
        }
      });
    }
  }, [item.id, item.type]);

  useEffect(() => {
    const isFirstEntryCreation =
      prevTimeframe.current === undefined &&
      currentEntry?.timeframeKey !== undefined;
    const isNewDayReset =
      prevTimeframe.current !== undefined &&
      currentEntry?.timeframeKey !== undefined &&
      currentEntry.timeframeKey !== prevTimeframe.current;

    if (isNewDayReset) {
      setOptimisticCompleted(dbCompleted);
      setOptimisticCurrent(dbCurrent);
      setOptimisticCategory(dbCategory);
      setOptimisticRangeNum(dbRangeNum);
      setLocalTime(baseTime);
      prevTimeframe.current = currentEntry.timeframeKey;
    } else {
      if (isFirstEntryCreation) {
        prevTimeframe.current = currentEntry.timeframeKey;
      }
      if (dbCurrent > optimisticCurrent) setOptimisticCurrent(dbCurrent);
      if (dbDuration > localTime && item.type === "simple_time")
        setLocalTime(dbDuration);
      if (dbCurrent > localTime && item.type === "target_time")
        setLocalTime(dbCurrent);
      if (dbCompleted && !optimisticCompleted) setOptimisticCompleted(true);
      if (!optimisticCategory && dbCategory) setOptimisticCategory(dbCategory);
      if (!optimisticRangeNum && dbRangeNum) setOptimisticRangeNum(dbRangeNum);
    }
  }, [
    currentEntry,
    baseTime,
    dbCompleted,
    dbCurrent,
    dbDuration,
    dbCategory,
    dbRangeNum,
    item.type,
  ]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (timerActive) {
      if (!startTimeRef.current) {
        const now = Date.now();
        startTimeRef.current = now;
        if (!item.id.includes("mock_")) {
          SecureStore.setItemAsync(`timer_start_${item.id}`, now.toString());
        }
      }

      const updateTime = () => {
        if (!startTimeRef.current) return;
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
        setLocalTime(baseTime + elapsedSeconds);
        sessionAccumulator.current = elapsedSeconds;
      };

      interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, baseTime, item.id]);

  const handleTimerToggle = () => {
    if (timerActive) {
      if (!item.id.includes("mock_"))
        SecureStore.deleteItemAsync(`timer_start_${item.id}`);
      startTimeRef.current = null;

      if (item.type === "target_time")
        onUpdate(item.id, { current: sessionAccumulator.current });
      else if (item.type === "simple_time")
        onUpdate(item.id, { durationSeconds: localTime });

      sessionAccumulator.current = 0;
    }
    setTimerActive(!timerActive);
  };

  const [incrementValue, setIncrementValue] = useState("1");
  const [isCacheLoaded, setIsCacheLoaded] = useState(
    item.type !== "count_target" && item.type !== "count_continuous",
  );

  // --- INLINE RANGE EDITING LOGIC ---
  const [isEditingRange, setIsEditingRange] = useState(false);
  const min = (item.settings as NumberRangeSettings)?.rangeLowerBound || 0;
  const max = (item.settings as NumberRangeSettings)?.rangeUpperBound || 10;
  const currentNum = optimisticRangeNum;
  const [tempRangeVal, setTempRangeVal] = useState(
    currentNum !== undefined ? currentNum.toString() : "",
  );

  const rangeInputRef = useRef<TextInput>(null);

  const finalizeRange = () => {
    setIsEditingRange(false);
    rangeInputRef.current?.blur();

    if (!tempRangeVal || isNaN(parseInt(tempRangeVal, 10))) {
      setTempRangeVal(currentNum !== undefined ? currentNum.toString() : "");
      return;
    }
    let val = parseInt(tempRangeVal, 10);
    if (val < min) val = min;
    if (val > max) val = max;

    if (val !== currentNum) {
      setOptimisticRangeNum(val);
      onUpdate(item.id, { selectedRangeNumber: val });
    }
    setTempRangeVal(val.toString());
  };

  useEffect(() => {
    if (item.id.includes("mock_")) {
      setIsCacheLoaded(true);
      return;
    }

    if (item.type === "count_target" || item.type === "count_continuous") {
      SecureStore.getItemAsync(`increment_${item.id}`).then((val) => {
        if (val) setIncrementValue(val);
        setIsCacheLoaded(true);
      });
    }
  }, [item.id, item.type]);

  const handleIncrementChange = (val: string) => {
    setIncrementValue(val);
    if (!item.id.includes("mock_"))
      SecureStore.setItemAsync(`increment_${item.id}`, val);
  };

  const toggleBoolean = () => {
    setOptimisticCompleted(!optimisticCompleted);
    onUpdate(item.id, { completed: !optimisticCompleted });
  };

  let target = 0;
  let isDone = false;

  if (item.type === "count_target") {
    target = (item.settings as CountTargetSettings)?.target || 0;
    isDone = optimisticCurrent >= target;
  } else if (item.type === "boolean") {
    isDone = optimisticCompleted;
  } else if (item.type === "target_time") {
    target = (item.settings as TargetTimeSettings)?.target || 0;
    isDone = localTime >= target;
  } else if (item.type === "categorical") {
    isDone = !!optimisticCategory;
  } else if (item.type === "number_range") {
    isDone = optimisticRangeNum !== undefined;
  }

  const [floatingParticles, setFloatingParticles] = useState<
    FloatingParticle[]
  >([]);
  const fillAnim = useRef(new Animated.Value(isDone ? 1 : 0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const prevIsDone = useRef(isDone);

  useEffect(() => {
    if (isDone !== prevIsDone.current) {
      if (isDone) {
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
        burstAnim.setValue(0);
        Animated.timing(burstAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
      prevIsDone.current = isDone;
    }
  }, [isDone]);

  const triggerFloatingNumber = (val: number) => {
    const newParticle: FloatingParticle = {
      id: Math.random().toString(),
      val,
      anim: new Animated.Value(0),
      xOffset: (Math.random() - 0.5) * 60,
    };
    setFloatingParticles((prev) => [...prev, newParticle]);
    Animated.timing(newParticle.anim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setFloatingParticles((prev) =>
        prev.filter((p) => p.id !== newParticle.id),
      );
    });
  };

  const renderBurst = () => (
    <View
      style={[StyleSheet.absoluteFill, styles.burstContainer]}
      pointerEvents="none"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.burstLine,
            {
              transform: [
                { rotate: `${(i * 360) / 8}deg` },
                {
                  translateY: burstAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -70],
                  }),
                },
                {
                  scaleY: burstAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.8, 0],
                  }),
                },
              ],
              opacity: burstAnim.interpolate({
                inputRange: [0, 0.1, 0.7, 1],
                outputRange: [0, 1, 1, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  const renderControl = () => {
    if (item.type === "boolean") {
      return (
        <View
          style={[styles.checkbox, isDone && styles.checkboxChecked]}
          pointerEvents="none"
        >
          {isDone && (
            <Feather name="check" size={20} color={colors.iconWhite} />
          )}
        </View>
      );
    }

    if (item.type === "count_target" || item.type === "count_continuous") {
      return (
        <View
          style={[styles.counterWrapper, { opacity: isCacheLoaded ? 1 : 0 }]}
        >
          <View style={styles.counterInner}>
            <Text style={styles.changeByLabel}>Change By</Text>
            <View style={styles.controlAnchor}>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.decrementBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    const val = parseInt(incrementValue, 10);
                    if (!isNaN(val) && val > 0) {
                      setOptimisticCurrent((prev) => prev - val);
                      triggerFloatingNumber(-val);
                      onUpdate(item.id, { addedAmount: -val });
                    }
                  }}
                >
                  <Feather name="minus" size={16} color={colors.iconWhite} />
                </TouchableOpacity>

                <TextInput
                  style={styles.incrementInput}
                  keyboardType="number-pad"
                  value={incrementValue}
                  onChangeText={(val) =>
                    handleIncrementChange(val.replace(/[^0-9]/g, ""))
                  }
                  maxLength={5}
                />

                <TouchableOpacity
                  style={[
                    styles.incrementBtn,
                    isDone && styles.incrementBtnDone,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    const val = parseInt(incrementValue, 10);
                    if (!isNaN(val) && val > 0) {
                      setOptimisticCurrent((prev) => prev + val);
                      triggerFloatingNumber(val);
                      onUpdate(item.id, { addedAmount: val });
                    }
                  }}
                >
                  <Feather name="plus" size={16} color={colors.iconWhite} />
                </TouchableOpacity>
              </View>

              <View style={styles.floatingContainer} pointerEvents="none">
                {floatingParticles.map((p) => (
                  <Animated.Text
                    key={p.id}
                    style={[
                      styles.floatingText,
                      {
                        color: p.val > 0 ? colors.successSolid : colors.danger,
                      },
                      {
                        transform: [
                          {
                            translateY: p.anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -60],
                            }),
                          },
                          {
                            translateX: p.anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, p.xOffset],
                            }),
                          },
                          {
                            scale: p.anim.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0.5, 1.2, 1],
                            }),
                          },
                        ],
                        opacity: p.anim.interpolate({
                          inputRange: [0, 0.7, 1],
                          outputRange: [1, 1, 0],
                        }),
                      },
                    ]}
                  >
                    {p.val > 0 ? "+" : ""}
                    {p.val}
                  </Animated.Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === "target_time" || item.type === "simple_time") {
      return (
        <View style={styles.timerWrapper}>
          <TouchableOpacity
            style={[styles.playBtn, timerActive ? styles.pauseBtn : null]}
            onPress={handleTimerToggle}
            activeOpacity={0.8}
          >
            <Feather
              name={timerActive ? "pause" : "play"}
              size={18}
              color={colors.iconWhite}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.timerDisplay,
              isDone && styles.timerDisplayDone,
              timerActive && styles.timerDisplayActive,
            ]}
          >
            <Text
              style={[
                styles.timerValue,
                (isDone || timerActive) && { color: colors.iconWhite },
              ]}
            >
              {formatTime(localTime)}
            </Text>
          </View>
        </View>
      );
    }

    if (item.type === "number_range") {
      return (
        <View style={styles.rangeWrapper}>
          {/* INLINE TEXT INPUT REPLACING MODAL */}
          <TextInput
            ref={rangeInputRef}
            style={[
              styles.rangeInlineInput,
              isEditingRange && styles.rangeInlineInputActive,
            ]}
            keyboardType="number-pad"
            placeholder="-"
            placeholderTextColor={colors.textMuted}
            value={
              isEditingRange
                ? tempRangeVal
                : currentNum !== undefined
                  ? currentNum.toString()
                  : ""
            }
            onChangeText={(val) =>
              setTempRangeVal(
                val.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, ""),
              )
            }
            onFocus={() => {
              setIsEditingRange(true);
              setTempRangeVal(
                currentNum !== undefined ? currentNum.toString() : "",
              );
            }}
            onBlur={finalizeRange}
            onSubmitEditing={finalizeRange}
          />
          <TouchableOpacity
            style={[
              styles.rangeActionBtn,
              isEditingRange && { backgroundColor: colors.successSolid },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              if (isEditingRange) {
                finalizeRange();
              } else {
                rangeInputRef.current?.focus();
              }
            }}
          >
            <Text style={styles.rangeActionBtnText}>
              {isEditingRange ? "Save" : "Enter Value"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderStatsGrid = () => {
    if (
      item.type === "boolean" ||
      item.type === "categorical" ||
      item.type === "simple_time"
    )
      return null;

    let stats = [];
    if (item.type === "count_target") {
      stats.push({ label: "CURRENT", value: optimisticCurrent });
      stats.push({ label: "TARGET", value: target });
    } else if (item.type === "count_continuous") {
      stats.push({ label: "TOTAL COUNT", value: optimisticCurrent });
    } else if (item.type === "target_time") {
      stats.push({ label: "TARGET TIME", value: formatTime(target) });
    } else if (item.type === "number_range") {
      const min = (item.settings as NumberRangeSettings)?.rangeLowerBound || 0;
      const max = (item.settings as NumberRangeSettings)?.rangeUpperBound || 10;
      stats.push({ label: "MIN LIMIT", value: min });
      stats.push({ label: "MAX LIMIT", value: max });
    }

    if (stats.length === 0) return null;

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.statCol}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, isDone && styles.statValueDone]}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const ContentWrapper = item.type === "boolean" ? TouchableOpacity : View;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.fillBackground,
          {
            width: fillAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
      {renderBurst()}

      <ContentWrapper
        activeOpacity={item.type === "boolean" ? 0.7 : 1}
        onPress={item.type === "boolean" ? toggleBoolean : undefined}
        style={styles.mainContent}
      >
        <View style={styles.infoCol}>
          <View style={styles.nameHeader}>
            <Text style={styles.name}>{item.name}</Text>
          </View>

          {item.itemResetIntervalValue &&
            item.itemResetIntervalUnit &&
            (() => {
              const resetInfo = getNextResetText(
                item.itemResetIntervalValue,
                item.itemResetIntervalUnit,
              );
              if (!resetInfo) return null;
              return (
                <View style={styles.resetContainer}>
                  <Text style={styles.intervalText}>{resetInfo.interval}</Text>
                  <Text style={styles.nextResetText}>{resetInfo.next}</Text>
                </View>
              );
            })()}

          {renderStatsGrid()}

          {item.type === "categorical" && (
            <View style={styles.categoryGrid}>
              {(item.settings as CategoricalSettings)?.categories?.map(
                (cat: string) => {
                  const isSelected = optimisticCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        isSelected && styles.catPillSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setOptimisticCategory(cat);
                        onUpdate(item.id, { selectedCategory: cat });
                      }}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          isSelected && styles.catPillTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          )}
        </View>

        {item.type !== "categorical" && (
          <View style={styles.controlCol}>{renderControl()}</View>
        )}
      </ContentWrapper>

      {!item.id.includes("mock_") && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => onEdit(item.id, item.name)}
            style={styles.actionBtn}
          >
            <Feather name="edit-2" size={14} color={colors.textMuted} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item.id, item.name)}
            style={styles.actionBtn}
          >
            <Feather name="trash-2" size={14} color={colors.danger} />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },

  fillBackground: {
    backgroundColor: colors.successBackground,
    borderRadius: 8,
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    zIndex: 2,
  },
  infoCol: { flex: 1, paddingRight: 10 },
  controlCol: { justifyContent: "center", alignItems: "flex-end" },
  controlAnchor: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  nameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: { fontSize: 16, fontWeight: "800", color: colors.textMain, flex: 1 },

  resetContainer: { marginTop: 4, marginBottom: 2 },
  intervalText: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
  nextResetText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },

  statsGrid: { flexDirection: "row", gap: 16, marginTop: 8 },
  statCol: { flexDirection: "column", gap: 2 },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: { fontSize: 14, fontWeight: "800", color: colors.textMain },
  statValueDone: { color: colors.successSolid },

  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.successSolid,
    borderColor: colors.successSolid,
  },

  burstContainer: { justifyContent: "center", alignItems: "center", zIndex: 5 },
  burstLine: {
    position: "absolute",
    width: 6,
    height: 18,
    borderRadius: 3,
    backgroundColor: colors.successSolid,
  },

  counterWrapper: { alignItems: "flex-end" },
  counterInner: { alignItems: "center" },
  changeByLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  incrementInput: {
    minWidth: 60,
    paddingVertical: 0,
    paddingHorizontal: 4,
    backgroundColor: colors.inputBg,
    height: 36,
    borderRadius: 6,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  decrementBtn: {
    backgroundColor: colors.danger,
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  incrementBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  incrementBtnDone: { backgroundColor: colors.successSolid },

  floatingContainer: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    alignItems: "center",
    height: 100,
    zIndex: 10,
  },
  floatingText: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "900",
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  timerWrapper: { flexDirection: "row", alignItems: "center", gap: 8 },
  timerDisplay: {
    backgroundColor: colors.inputBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: "center",
  },
  timerDisplayDone: {
    backgroundColor: colors.successSolid,
    borderColor: colors.successSolid,
  },
  timerDisplayActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timerValue: { fontSize: 14, fontWeight: "700", color: colors.textMain },
  playBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pauseBtn: { backgroundColor: colors.danger, shadowColor: colors.danger },

  // New Inline Range Styles
  rangeWrapper: { flexDirection: "row", alignItems: "center", gap: 8 },
  rangeInlineInput: {
    minWidth: 44,
    height: 36,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMain,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  rangeInlineInputActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  rangeActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rangeActionBtnText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "700",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  catPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillSelected: {
    backgroundColor: colors.successSolid,
    borderColor: colors.successSolid,
  },
  catPillText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  catPillTextSelected: { color: colors.surface, fontWeight: "700" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    zIndex: 2,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  editText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  deleteText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
