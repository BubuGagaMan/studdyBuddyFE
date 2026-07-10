// src/components/AddListItemButton.tsx
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

interface Props {
  title: string;
  onPress: () => void;
}

export const AddListItemButton = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Feather name="plus" size={14} color={colors.primary} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF4FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.15)",
  },
  text: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
