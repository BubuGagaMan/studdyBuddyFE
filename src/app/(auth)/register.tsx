// src/app/(auth)/register.tsx
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { api } from "../../api/client";

export default function RegisterScreen() {
  const router = useRouter();

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus Refs for Keyboard "Next" Navigation
  const emailRef = useRef<TextInput>(null);
  const confirmEmailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // STEP 1: Validate and Send Details to get a code
  const handleSendCode = async () => {
    if (!username || !email || !confirmEmail || !password || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert("Error", "Please enter a valid email address.");
    }

    if (email !== confirmEmail) {
      return Alert.alert("Error", "Email addresses do not match.");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(password)) {
      return Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
      );
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    setIsSubmitting(true);
    try {
      await api.post("/register-confirmation", { username, email, password });
      setStep(2);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send confirmation code.";
      Alert.alert("Registration Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify code to finalize account
  const handleFinalizeRegistration = async () => {
    if (!confirmationCode || confirmationCode.length !== 6) {
      return Alert.alert("Error", "Please enter the 6-character code.");
    }

    setIsSubmitting(true);
    try {
      await api.post("/register", {
        confirmationCode: confirmationCode.toUpperCase(),
      });

      Alert.alert(
        "Success!",
        "Your account has been created. You can now log in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Invalid or expired code.";
      Alert.alert("Verification Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {step === 1 ? "Create Account" : "Verify Email"}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? "Sign up to start tracking your checklists"
            : `We sent a 6-character code to ${email}`}
        </Text>

        {step === 1 ? (
          <>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username (no spaces)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => confirmEmailRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Confirm Email</Text>
            <TextInput
              ref={confirmEmailRef}
              style={styles.input}
              placeholder="Re-enter email address"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Min 8 chars, 1 upper, 1 special"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              ref={confirmPasswordRef}
              style={styles.input}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSendCode}
            />

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Sending..." : "Send Confirmation Code"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={[
                styles.input,
                { textAlign: "center", fontSize: 24, letterSpacing: 5 },
              ]}
              placeholder="XXXXXX"
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              autoCapitalize="characters"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleFinalizeRegistration}
            />
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleFinalizeRegistration}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Verifying..." : "Complete Registration"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep(1)}
              disabled={isSubmitting}
            >
              <Text style={styles.backText}>
                Wait, I need to change my email
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 1 && (
          <TouchableOpacity
            style={styles.footerBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.linkText}>Log in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginLeft: 2,
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
  backBtn: { marginTop: 20, alignItems: "center" },
  backText: { color: "#666", fontSize: 14, textDecorationLine: "underline" },
  footerBtn: { marginTop: 30, alignItems: "center" },
  footerText: { color: "#666", fontSize: 15 },
  linkText: { color: "#007AFF", fontWeight: "bold" },
});
