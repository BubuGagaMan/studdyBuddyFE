// src/api/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { BASE_URL, CLIENT_TYPE } from "./config";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// endpoints where a 401 means bad credentials/code, not an expired access token
const NO_REFRESH_PATHS = [
  "/login",
  "/logout",
  "/refresh-token",
  "/register",
  "/register-confirmation",
  "/password-reset-code",
  "/user-password-reset",
];

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

  config.headers["x-client-type"] = CLIENT_TYPE;

  // Grab the native device timezone (e.g., "Europe/London")
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (userTimezone) {
    config.headers["x-user-timezone"] = userTimezone;
  }

  return config;
});

// The backend rotates the refresh token on every refresh, so concurrent 401s must share
// a single refresh call - a second call would send the already-revoked token and fail.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  let refreshPayload = {};

  // mobile needs to send the token in the body, web relies on the httpOnly cookie
  if (Platform.OS !== "web") {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");
    refreshPayload = { refreshToken };
  }

  // plain axios to prevent interceptor infinite loops
  const response = await axios.post(`${BASE_URL}/refresh-token`, refreshPayload, {
    withCredentials: true,
    headers: { "x-client-type": CLIENT_TYPE },
  });

  const { accessToken: newAccess, refreshToken: newRefresh } =
    response.data.data;

  // Save tokens natively ONLY if on mobile
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync("access_token", newAccess);
    if (newRefresh) {
      await SecureStore.setItemAsync("refresh_token", newRefresh);
    }
  }

  const { user, setAuth } = useAuthStore.getState();
  setAuth(user!, newAccess);

  return newAccess;
};

// Intercept responses to handle seamless 401 token refreshes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshable =
      originalRequest && !NO_REFRESH_PATHS.includes(originalRequest.url);

    if (
      error.response?.status === 401 &&
      isRefreshable &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccess = await refreshPromise;

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
