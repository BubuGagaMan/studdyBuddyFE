// src/shared/api/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

// Shared so non-React code (e.g. logout) can clear cached server data.
export const queryClient = new QueryClient();
