import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../api/client";
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/login", { username, password });

      const { accessToken, refreshToken } = response.data.data || {};

      // handle SecureStore only for mobile
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync("access_token", accessToken);
        if (refreshToken) {
          await SecureStore.setItemAsync("refresh_token", refreshToken);
        }
      }

      setAuth(
        { id: "temp-id", username, email: "", roles: [], suspended: false },
        accessToken,
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* ADDED: Link to Registration */}
      <View style={styles.footerLinksContainer}>
        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          style={styles.linkButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.linkButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerLinksContainer: {
    marginTop: 40, // Strong margin to separate from the main login form
    alignItems: "center", // Centers the buttons horizontally
    gap: 24, // Generous spacing between the two links
    paddingBottom: 20,
  },
  linkButton: {
    paddingHorizontal: 16,
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f0f0f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#99c9ff" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footerBtn: { marginTop: 30, alignItems: "center" },
  footerText: { color: "#666", fontSize: 15 },
});
