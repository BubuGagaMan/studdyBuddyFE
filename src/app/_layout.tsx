// src/app/_layout.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { queryClient } from "@/shared/api/queryClient";
import { useActiveFontLoaded } from "@/shared/theme/useActiveFontLoaded";
import { useAuthStore } from "@/shared/auth/useAuthStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, initializeAuth, isLoading } = useAuthStore();
  // waits for saved preferences, then the chosen handwriting font
  const fontReady = useActiveFontLoaded();
  const segments = useSegments();
  const router = useRouter();

  const ready = !isLoading && fontReady;

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, segments, ready]);

  if (!ready) return null;

  // Wrap the Slot with the QueryClientProvider and inject the StatusBar
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Slot />
    </QueryClientProvider>
  );
}
