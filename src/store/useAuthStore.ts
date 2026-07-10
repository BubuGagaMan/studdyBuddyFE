// store/useAuthStore.ts
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        // For a foolproof boot, we start with token visibility,
        // and our Axios interceptor will automatically refresh it if expired.
        set({ accessToken: token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
