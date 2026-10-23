// src/features/auth/RequestResetForm.tsx
import { InkNote, LinedInput, SketchButton } from "@/shared/ui";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useState } from "react";
import { requestPasswordResetCode } from "./authApi";
import { assertEmail } from "./validation";

interface RequestResetFormProps {
  onCodeSent: () => void;
}

/** Step 1: ask for a recovery code to be emailed. */
export const RequestResetForm = ({ onCodeSent }: RequestResetFormProps) => {
  const [email, setEmail] = useState("");
  const { run, isRunning, error } = useAsyncAction("An error occurred.");

  const handleSubmit = () =>
    run(async () => {
      assertEmail(email);
      await requestPasswordResetCode(email.trim().toLowerCase());
      // always move on, so the response doesn't reveal whether the email exists
      onCodeSent();
    });

  return (
    <>
      <LinedInput
        label="Email address"
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {error && <InkNote tone="error">{error}</InkNote>}

      <SketchButton title="Send recovery code" onPress={handleSubmit} loading={isRunning} />
    </>
  );
};
