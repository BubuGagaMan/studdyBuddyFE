// src/shared/ui/SketchLine.tsx
import { useLayoutSize } from "@/shared/hooks/useLayoutSize";
import { sketchLine, useSketchSeed } from "@/shared/sketch";
import { stroke as strokeWidths, useTheme } from "@/shared/theme";
import { useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Path } from "react-native-svg";
import { SketchCanvas } from "./SketchCanvas";

interface SketchLineProps {
  color?: string;
  strokeWidth?: number;
  roughness?: number;
  seed?: string | number;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT = 8;

/** A hand-drawn horizontal line that stretches to its container's width. */
export const SketchLine = ({
  color,
  strokeWidth = strokeWidths.regular,
  roughness,
  seed,
  style,
}: SketchLineProps) => {
  const theme = useTheme();
  const { width, onLayout } = useLayoutSize();
  const sketchSeed = useSketchSeed(seed);

  const d = useMemo(
    () =>
      width ? sketchLine(width, HEIGHT / 2, { seed: sketchSeed, roughness }) : "",
    [width, sketchSeed, roughness],
  );

  return (
    <View
      style={[{ height: HEIGHT, alignSelf: "stretch" }, style]}
      onLayout={onLayout}
      pointerEvents="none"
    >
      {!!d && (
        <SketchCanvas width={width} height={HEIGHT}>
          <Path
            d={d}
            stroke={color ?? theme.colors.ink}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </SketchCanvas>
      )}
    </View>
  );
};
