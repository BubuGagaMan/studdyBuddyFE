// src/api/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL!;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = async () => {
  if (Platform.OS === "web") {
    return useAuthStore.getState().accessToken;
  } else {
    return await SecureStore.getItemAsync("access_token");
  }
};

// Automatically inject access token AND Timezone into outgoing requests
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers["access-token"] = token;
  }

  config.headers["x-client-type"] = Platform.OS === "web" ? "web" : "mobile";

  // Grab the native device timezone (e.g., "Europe/London")
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (userTimezone) {
    config.headers["x-user-timezone"] = userTimezone;
  }

  return config;
});

// Intercept responses to handle seamless 401 token refreshes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        let refreshPayload = {};

        // mobile needs to send the token in the body, web leaves payload empty.
        if (Platform.OS !== "web") {
          const refreshToken = await SecureStore.getItemAsync("refresh_token");
          if (!refreshToken) throw new Error("No refresh token available");
          refreshPayload = { refreshToken };
        }

        // prevent interceptor infinite loops
        const response = await axios.post(
          `${BASE_URL}/refresh-token`,
          refreshPayload,
          {
            withCredentials: true,
          },
        );

        const { accessToken: newAccess, refreshToken: newRefresh } =
          response.data.data;

        // Save tokens natively ONLY if on mobile
        if (Platform.OS !== "web") {
          await SecureStore.setItemAsync("access_token", newAccess);
          if (newRefresh) {
            await SecureStore.setItemAsync("refresh_token", newRefresh);
          }
        }

        // Update global state & retry request (for both platforms)
        useAuthStore
          .getState()
          .setAuth(
            response.data.data.user || useAuthStore.getState().user,
            newAccess,
          );

        originalRequest.headers["access-token"] = newAccess;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, silently clean up and force log out
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
