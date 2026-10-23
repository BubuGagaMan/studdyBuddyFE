import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { BASE_URL, CLIENT_TYPE } from "@/shared/api/config";
import { queryClient } from "@/shared/api/queryClient";

// Only the session lives here. The user's profile is server data - see useCurrentUser.
interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (accessToken: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (accessToken) =>
    set({ accessToken, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    const { accessToken } = get();
    let mobileRefreshToken = "";

    if (Platform.OS !== "web") {
      mobileRefreshToken =
        (await SecureStore.getItemAsync("refresh_token")) || "";
    }
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {
          ...(Platform.OS !== "web" && { refreshToken: mobileRefreshToken }),
        },
        {
          withCredentials: true,
          headers: {
            // manually inject the access token so backend doesn't 401
            "access-token": accessToken,
            "x-client-type": CLIENT_TYPE,
          },
        },
      );
    } catch (e) {
      console.warn(
        "Backend logout failed (token likely already expired). Proceeding with local logout.",
        e,
      );
    }

    // clear local storage, regardless of backend success
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
    }

    // drop cached server data, so the next user on this device never sees the previous one's
    queryClient.clear();

    // wipe global state
    set({
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    try {
      if (Platform.OS !== "web") {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          set({ accessToken: token, isAuthenticated: true, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      } else {
        try {
          const response = await axios.post(
            `${BASE_URL}/refresh-token`,
            {},
            {
              withCredentials: true,
              headers: { "x-client-type": CLIENT_TYPE },
            },
          );
          const { accessToken } = response.data.data;
          set({ accessToken, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isAuthenticated: false, isLoading: false });
        }
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
