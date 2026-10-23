// src/app/(auth)/register.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  InkNote,
  NotebookScreen,
  PageHeader,
  SketchButton,
} from "@/shared/ui";
import { AuthFooterLinks } from "@/features/auth/AuthFooterLinks";
import {
  RegisterDetailsForm,
  emptyRegisterDetails,
} from "@/features/auth/RegisterDetailsForm";
import { VerifyEmailForm } from "@/features/auth/VerifyEmailForm";

type Step = "details" | "verify" | "done";

const headers: Record<Step, { title: string; subtitle: (email: string) => string }> = {
  details: {
    title: "Create Account",
    subtitle: () => "Sign up to start tracking your checklists.",
  },
  verify: {
    title: "Verify Email",
    subtitle: (email) => `We sent a 6-character code to ${email}.`,
  },
  done: {
    title: "All Set!",
    subtitle: () => "Your account has been created.",
  },
};

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  // kept here so "change my email" returns to a filled-in form
  const [details, setDetails] = useState(emptyRegisterDetails);
  const goToLogin = () => router.replace("/(auth)/login");

  return (
    <NotebookScreen scroll centered>
      <PageHeader title={headers[step].title} subtitle={headers[step].subtitle(details.email.trim())} />

      {step === "details" && (
        <RegisterDetailsForm
          initialValues={details}
          onCodeSent={(submitted) => {
            setDetails(submitted);
            setStep("verify");
          }}
        />
      )}

      {step === "verify" && (
        <VerifyEmailForm
          onVerified={() => setStep("done")}
          onChangeEmail={() => setStep("details")}
        />
      )}

      {step === "done" && (
        <>
          <InkNote tone="success">You can now log in with your new account.</InkNote>
          <SketchButton title="Go to login" onPress={goToLogin} />
        </>
      )}

      {step === "details" && (
        <AuthFooterLinks
          links={[{ title: "Already have an account? Log in", onPress: goToLogin }]}
        />
      )}
    </NotebookScreen>
  );
}
