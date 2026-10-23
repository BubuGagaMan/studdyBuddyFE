// src/shared/ui/SketchCheckbox.tsx
import { useTheme } from "@/shared/theme";
import { View } from "react-native";
import { SketchBox } from "./SketchBox";
import { SketchTick } from "./SketchTick";

interface SketchCheckboxProps {
  checked: boolean;
  size?: number;
  seed?: string | number;
}

/** A pencilled square with a pen tick. Visual only - wrap it in a Pressable. */
export const SketchCheckbox = ({ checked, size = 32, seed }: SketchCheckboxProps) => {
  const theme = useTheme();

  return (
    <SketchBox
      seed={seed}
      roughness={size < 26 ? 0.4 : 0.8}
      stroke={checked ? theme.colors.success : theme.colors.inkMuted}
      fill={theme.colors.page}
      style={{ width: size, height: size }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {checked && <SketchTick size={size * 0.85} strokeWidth={size < 26 ? 2.5 : 3.5} seed={seed} />}
      </View>
    </SketchBox>
  );
};
