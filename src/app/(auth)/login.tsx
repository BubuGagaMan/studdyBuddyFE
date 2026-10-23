// src/app/(auth)/login.tsx
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TextInput } from "react-native";
import {
  InkNote,
  LinedInput,
  NotebookScreen,
  PageHeader,
  SketchButton,
} from "@/shared/ui";
import { AuthFooterLinks } from "@/features/auth/AuthFooterLinks";
import { login } from "@/features/auth/authApi";
import { assertFilled } from "@/features/auth/validation";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<TextInput>(null);
  const { run, isRunning, error } = useAsyncAction("Login failed. Please try again.");

  // a successful login flips isAuthenticated; the root layout redirects
  const handleLogin = () =>
    run(async () => {
      assertFilled(username, password);
      await login(username.trim(), password);
    });

  return (
    <NotebookScreen scroll centered>
      <PageHeader title="Welcome Back" subtitle="Pick up where you left off." />

      <LinedInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />
      <LinedInput
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />

      {error && <InkNote tone="error">{error}</InkNote>}

      <SketchButton
        title="Login"
        onPress={handleLogin}
        loading={isRunning}
      />

      <AuthFooterLinks
        links={[
          { title: "Forgot password?", onPress: () => router.push("/forgot-password") },
          { title: "Don't have an account? Sign up", onPress: () => router.push("/register") },
        ]}
      />
    </NotebookScreen>
  );
}
