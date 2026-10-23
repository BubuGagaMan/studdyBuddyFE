// src/features/auth/ResetPasswordForm.tsx
import { InkNote, LinedInput, SketchButton } from "@/shared/ui";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useRef, useState } from "react";
import { TextInput } from "react-native";
import { resetPassword } from "./authApi";
import { CodeInput } from "./CodeInput";
import { PASSWORD_HINT, assertCode, assertPassword } from "./validation";

interface ResetPasswordFormProps {
  onReset: () => void;
}

/** Step 2: use the emailed code to set a new password. */
export const ResetPasswordForm = ({ onReset }: ResetPasswordFormProps) => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<TextInput>(null);
  const { run, isRunning, error } = useAsyncAction("Invalid or expired recovery code.");

  const handleSubmit = () =>
    run(async () => {
      assertCode(code);
      assertPassword(password);
      await resetPassword(code.trim(), password);
      onReset();
    });

  return (
    <>
      <CodeInput
        label="Recovery code"
        value={code}
        onChangeText={setCode}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <LinedInput
        ref={passwordRef}
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <InkNote>{PASSWORD_HINT}</InkNote>

      {error && <InkNote tone="error">{error}</InkNote>}

      <SketchButton title="Update password" onPress={handleSubmit} loading={isRunning} />
    </>
  );
};
