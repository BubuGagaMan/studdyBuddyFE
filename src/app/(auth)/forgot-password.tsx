// src/app/forgot-password.tsx
import { api } from "@/api/client";
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
import { colors } from "../../constants/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");

  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email.trim()) {
      return Alert.alert("Whoops", "Please enter your email address.");
    }

    setIsLoading(true);
    try {
      // NOTE: Adjust this URL to match your fastify routes
      await api.post("/auth/reset-password-request", {
        email: email.trim().toLowerCase(),
      });

      // We always move to step 2 to prevent email enumeration (as per your backend logic)
      setStep(2);
    } catch (error: any) {
      Alert.alert(
        "Whoops",
        error.response?.data?.message || "An error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirmationCode.trim() || !newPassword.trim()) {
      return Alert.alert(
        "Whoops",
        "Please enter the code and your new password.",
      );
    }

    setIsLoading(true);
    try {
      // NOTE: Adjust this URL to match your fastify routes (this belongs to user controller)
      const response = await api.post("/user/reset-password", {
        confirmationCode: confirmationCode.trim(),
        password: newPassword,
      });

      Alert.alert(
        "Success",
        response.data.message || "Your password has been reset!",
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Enter your email address and we'll send you a link to reset your password."
                : "Check your email for the recovery code."}
            </Text>
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
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

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRequestCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitText}>Send Recovery Code</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recovery Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  value={confirmationCode}
                  onChangeText={setConfirmationCode}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitText}>Update Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={() => setStep(1)}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>Change Email Address</Text>
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
