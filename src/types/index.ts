// src/types/index.ts

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  suspended: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type ChecklistItemType =
  | "boolean"
  | "target_time"
  | "simple_time"
  | "count_target"
  | "count_continuous"
  | "number_range"
  | "categorical";

// --- NEW SETTINGS INTERFACES ---
export interface CountTargetSettings {
  target: number;
}
export interface TargetTimeSettings {
  target: number; /* in seconds */
}
export interface NumberRangeSettings {
  rangeLowerBound: number;
  rangeUpperBound: number;
}
export interface CategoricalSettings {
  categories: string[];
}

export type ItemSettings =
  | CountTargetSettings
  | TargetTimeSettings
  | NumberRangeSettings
  | CategoricalSettings
  | Record<string, never>; // For boolean, simple_time, count_continuous

export interface ChecklistItemEntry {
  id: string;
  timeframeKey: string;
  completed?: boolean;
  current?: number;
  target?: number;
  durationSeconds?: number;
  selectedCategory?: string;
  selectedNumber?: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  type: ChecklistItemType;
  settings: ItemSettings;
  entries: ChecklistItemEntry[];
  itemResetIntervalValue?: number;
  itemResetIntervalUnit?: "hours" | "days" | "weeks" | "months";
}

export interface Checklist {
  id: string;
  name: string;
  isPerItem: boolean;
  resetIntervalValue: number | null;
  resetIntervalUnit: "hours" | "days" | "weeks" | "months" | null;
  items?: ChecklistItem[];
}
