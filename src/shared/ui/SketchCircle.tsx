// src/shared/ui/SketchCircle.tsx
import { sketchCircle, useSketchSeed } from "@/shared/sketch";
import { stroke as strokeWidths, useTheme } from "@/shared/theme";
import { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Circle, Path } from "react-native-svg";
import { SketchCanvas } from "./SketchCanvas";

interface SketchCircleProps {
  size: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  seed?: string | number;
  children?: ReactNode;
}

/** A hand-drawn circle with centred content (avatars, swatches). */
export const SketchCircle = ({
  size,
  stroke,
  fill,
  strokeWidth = strokeWidths.regular,
  seed,
  children,
}: SketchCircleProps) => {
  const theme = useTheme();
  const sketchSeed = useSketchSeed(seed);
  const d = useMemo(() => sketchCircle(size, { seed: sketchSeed }), [size, sketchSeed]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <SketchCanvas width={size} height={size}>
        {fill && <Circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill={fill} />}
        <Path
          d={d}
          stroke={stroke ?? theme.colors.ink}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </SketchCanvas>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
