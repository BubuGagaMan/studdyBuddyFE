// src/shared/ui/SketchTick.tsx
import { sketchTick, useSketchSeed } from "@/shared/sketch";
import { stroke as strokeWidths, useTheme } from "@/shared/theme";
import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface SketchTickProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  seed?: string | number;
}

export const SketchTick = ({
  size = 22,
  color,
  strokeWidth = strokeWidths.bold,
  seed,
}: SketchTickProps) => {
  const theme = useTheme();
  const sketchSeed = useSketchSeed(seed);
  const d = useMemo(() => sketchTick(size, { seed: sketchSeed }), [size, sketchSeed]);

  return (
    // wrapped in a View: on web a bare <svg> isn't positioned, so a sibling sketch layer
    // (position: absolute) would paint over it. flexShrink 0 keeps it from collapsing in rows.
    <View style={{ flexShrink: 0 }}>
      <Svg width={size} height={size}>
        <Path
          d={d}
          stroke={color ?? theme.colors.success}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};
