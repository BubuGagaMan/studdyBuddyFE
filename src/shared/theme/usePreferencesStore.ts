// src/shared/theme/usePreferencesStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FontName } from "./fontSets";
import type { InkName } from "./inks";
import { deviceStorage } from "@/shared/utils/deviceStorage";

interface PreferencesState {
  ink: InkName;
  font: FontName;
  hasHydrated: boolean;
  setInk: (ink: InkName) => void;
  setFont: (font: FontName) => void; // load the font first - see loadFontSet
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ink: "ballpoint",
      font: "patrickHand",
      hasHydrated: false,
      setInk: (ink) => set({ ink }),
      setFont: (font) => set({ font }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => deviceStorage),
      partialize: ({ ink, font }) => ({ ink, font }),
      onRehydrateStorage: () => () => {
        usePreferencesStore.setState({ hasHydrated: true });
      },
    },
  ),
);
