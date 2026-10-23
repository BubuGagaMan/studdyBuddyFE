// src/app/(auth)/forgot-password.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  InkNote,
  NotebookScreen,
  PageHeader,
  SketchButton,
} from "@/shared/ui";
import { AuthFooterLinks } from "@/features/auth/AuthFooterLinks";
import { RequestResetForm } from "@/features/auth/RequestResetForm";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";

type Step = "request" | "reset" | "done";

const subtitles: Record<Step, string> = {
  request: "Enter your email address and we'll send you a recovery code.",
  reset: "Check your email for the recovery code.",
  done: "Your password has been updated.",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const goToLogin = () => router.replace("/(auth)/login");

  return (
    <NotebookScreen scroll centered>
      <PageHeader title="Reset Password" subtitle={subtitles[step]} />

      {step === "request" && <RequestResetForm onCodeSent={() => setStep("reset")} />}
      {step === "reset" && <ResetPasswordForm onReset={() => setStep("done")} />}
      {step === "done" && (
        <>
          <InkNote tone="success">You can now log in with your new password.</InkNote>
          <SketchButton title="Go to login" onPress={goToLogin} />
        </>
      )}

      {step !== "done" && (
        <AuthFooterLinks links={[{ title: "Back to login", onPress: goToLogin }]} />
      )}
    </NotebookScreen>
  );
}
