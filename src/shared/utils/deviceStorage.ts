// src/shared/utils/deviceStorage.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { StateStorage } from "zustand/middleware";

// Non-sensitive, per-device key/value storage (UI preferences, running timers...).
// Web: localStorage (may be unavailable in private mode, so failures are swallowed).
// Native: SecureStore, already a dependency and fine for tiny values.
// Keys may only contain letters, numbers, ".", "-" and "_" (SecureStore restriction).
export const deviceStorage: StateStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web") return window.localStorage.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web") window.localStorage.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {
      // value just won't persist
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === "web") window.localStorage.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {
      // nothing to remove
    }
  },
};
