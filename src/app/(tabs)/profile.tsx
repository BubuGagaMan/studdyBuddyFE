// src/app/(tabs)/profile.tsx
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarCircle}>
          <Feather name="user" size={40} color={colors.primary} />
        </View>
        <Text style={styles.username}>{user?.username || "User"}</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: colors.border,
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textMain,
    marginBottom: 40,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: 10,
  },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: "700" },
});
