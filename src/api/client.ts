// src/api/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = process.env.EXPO_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject access token AND Timezone into outgoing requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers["access-token"] = token;
  }

  // Grab the native device timezone (e.g., "Europe/London")
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (userTimezone) {
    // This perfectly matches what your backend controller is looking for!
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
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        // Fixed the route to match your backend's auth.routes.ts
        const response = await axios.post(`${BASE_URL}/refresh-token`, {
          refreshToken,
        });
        const { accessToken: newAccess, refreshToken: newRefresh } =
          response.data.data;

        // Save new tokens
        await SecureStore.setItemAsync("access_token", newAccess);
        await SecureStore.setItemAsync("refresh_token", newRefresh);

        // Update global state & retry request
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
