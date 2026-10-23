// src/features/auth/authApi.ts
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const login = async (username: string, password: string) => {
  const response = await api.post("/login", { username, password });
  const { accessToken, refreshToken } = response.data.data || {};

  // handle SecureStore only for mobile - web keeps the refresh token in an httpOnly cookie
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync("access_token", accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync("refresh_token", refreshToken);
    }
  }

  useAuthStore.getState().setAuth(accessToken);
};

export const requestRegistrationCode = (details: {
  username: string;
  email: string;
  password: string;
}) => api.post("/register-confirmation", details);

export const completeRegistration = (confirmationCode: string) =>
  api.post("/register", { confirmationCode });

export const requestPasswordResetCode = (email: string) =>
  api.post("/password-reset-code", { email });

export const resetPassword = (confirmationCode: string, password: string) =>
  api.put("/user-password-reset", { confirmationCode, password });
