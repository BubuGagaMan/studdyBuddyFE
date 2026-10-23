// src/shared/api/config.ts
import { Platform } from "react-native";

// Web relies on the httpOnly refresh_token cookie, which the browser only stores/sends
// when the API is same-site as the page (sameSite: "lax"), so web gets its own URL.
// Mobile needs a LAN-reachable address and doesn't use cookies.
export const BASE_URL =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_WEB_BASE_URL || "http://localhost:3001"
    : process.env.EXPO_PUBLIC_BASE_URL!;

export const CLIENT_TYPE = Platform.OS === "web" ? "web" : "mobile";
