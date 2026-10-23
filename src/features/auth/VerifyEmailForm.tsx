// src/features/auth/VerifyEmailForm.tsx
import { InkNote, SketchButton } from "@/shared/ui";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { createStyles } from "@/shared/theme";
import { useState } from "react";
import { View } from "react-native";
import { completeRegistration } from "./authApi";
import { CodeInput } from "./CodeInput";
import { assertCode } from "./validation";

interface VerifyEmailFormProps {
  onVerified: () => void;
  onChangeEmail: () => void;
}

/** Step 2: confirm the emailed code to create the account. */
export const VerifyEmailForm = ({ onVerified, onChangeEmail }: VerifyEmailFormProps) => {
  const styles = useStyles();
  const [code, setCode] = useState("");
  const { run, isRunning, error } = useAsyncAction("Invalid or expired code.");

  const handleSubmit = () =>
    run(async () => {
      assertCode(code);
      await completeRegistration(code.trim());
      onVerified();
    });

  return (
    <>
      <CodeInput
        label="Confirmation code"
        value={code}
        onChangeText={setCode}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {error && <InkNote tone="error">{error}</InkNote>}

      <SketchButton title="Complete registration" onPress={handleSubmit} loading={isRunning} />

      <View style={styles.back}>
        <SketchButton
          title="Wait, I need to change my email"
          variant="link"
          onPress={onChangeEmail}
          disabled={isRunning}
        />
      </View>
    </>
  );
};

const useStyles = createStyles((t) => ({
  back: { marginTop: t.spacing.lg },
}));
