// src/app/register.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api/client";
import { colors } from "../constants/colors";

export default function RegisterScreen() {
  const router = useRouter();

  // Step 1 State
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 State
  const [confirmationCode, setConfirmationCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Whoops", "Please fill in all fields.");
    }

    setIsLoading(true);
    try {
      // NOTE: Adjust this URL to match your fastify routes
      const response = await api.post("/auth/register-confirmation", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert(
        "Success",
        response.data.message || "Confirmation code sent to your email!",
      );
      setStep(2);
    } catch (error: any) {
      Alert.alert(
        "Whoops",
        error.response?.data?.message || "Failed to send confirmation code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!confirmationCode.trim()) {
      return Alert.alert("Whoops", "Please enter the confirmation code.");
    }

    setIsLoading(true);
    try {
      // NOTE: Adjust this URL to match your fastify routes
      const response = await api.post("/auth/register", {
        confirmationCode: confirmationCode.trim(),
      });

      Alert.alert(
        "Welcome!",
        response.data.message || "Registration successful. You can now log in.",
      );
      router.replace("/"); // Adjust to point to your login screen
    } catch (error: any) {
      Alert.alert(
        "Whoops",
        error.response?.data?.message ||
          "Invalid or expired confirmation code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color={colors.textMain} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Sign up to start tracking your habits."
                : "We sent a 6-digit code to your email."}
            </Text>
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. habitbuilder99"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRequestCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmation Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  value={confirmationCode}
                  onChangeText={setConfirmationCode}
                  keyboardType="default" // Use default if code can have letters, else 'number-pad'
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitText}>Complete Registration</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={() => setStep(1)}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>
                  Didn't receive it? Go back
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  header: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textMain,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: colors.textMuted, lineHeight: 22 },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },

  submitBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: colors.surface, fontSize: 16, fontWeight: "700" },

  resendBtn: { padding: 16, alignItems: "center" },
  resendText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
});
