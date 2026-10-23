// src/features/auth/RegisterDetailsForm.tsx
import { InkNote, LinedInput, SketchButton } from "@/shared/ui";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useRef, useState } from "react";
import { TextInput } from "react-native";
import { requestRegistrationCode } from "./authApi";
import {
  assertEmail,
  assertFilled,
  assertMatch,
  assertPassword,
} from "./validation";

export const emptyRegisterDetails = {
  username: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
};

export type RegisterDetails = typeof emptyRegisterDetails;

interface RegisterDetailsFormProps {
  initialValues: RegisterDetails;
  onCodeSent: (details: RegisterDetails) => void;
}

/** Step 1: collect account details and request an emailed confirmation code. */
export const RegisterDetailsForm = ({
  initialValues,
  onCodeSent,
}: RegisterDetailsFormProps) => {
  const [form, setForm] = useState(initialValues);
  const refs = {
    email: useRef<TextInput>(null),
    confirmEmail: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    confirmPassword: useRef<TextInput>(null),
  };
  const { run, isRunning, error } = useAsyncAction("Failed to send confirmation code.");

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (value: string) => setForm((prev) => ({ ...prev, [key]: value })),
  });

  const next = (key: keyof typeof refs) => ({
    returnKeyType: "next" as const,
    submitBehavior: "submit" as const,
    onSubmitEditing: () => refs[key].current?.focus(),
  });

  const handleSubmit = () =>
    run(async () => {
      const { username, email, confirmEmail, password, confirmPassword } = form;
      assertFilled(username, email, confirmEmail, password, confirmPassword);
      assertEmail(email);
      assertMatch(email.trim(), confirmEmail.trim(), "Email addresses");
      assertPassword(password);
      assertMatch(password, confirmPassword, "Passwords");

      await requestRegistrationCode({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      onCodeSent(form);
    });

  return (
    <>
      <LinedInput
        label="Username"
        placeholder="no spaces"
        autoCapitalize="none"
        autoCorrect={false}
        {...field("username")}
        {...next("email")}
      />
      <LinedInput
        ref={refs.email}
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        {...field("email")}
        {...next("confirmEmail")}
      />
      <LinedInput
        ref={refs.confirmEmail}
        label="Confirm email"
        autoCapitalize="none"
        keyboardType="email-address"
        {...field("confirmEmail")}
        {...next("password")}
      />
      <LinedInput
        ref={refs.password}
        label="Password"
        placeholder="8+ characters: Aa, 1, !"
        secureTextEntry
        autoComplete="new-password"
        {...field("password")}
        {...next("confirmPassword")}
      />
      <LinedInput
        ref={refs.confirmPassword}
        label="Confirm password"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        {...field("confirmPassword")}
      />

      {error && <InkNote tone="error">{error}</InkNote>}

      <SketchButton
        title="Send confirmation code"
        onPress={handleSubmit}
        loading={isRunning}
      />
    </>
  );
};
