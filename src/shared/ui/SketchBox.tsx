// src/shared/ui/SketchBox.tsx
import { useLayoutSize } from "@/shared/hooks/useLayoutSize";
import { sketchRect, useSketchSeed } from "@/shared/sketch";
import { stroke as strokeWidths, useTheme } from "@/shared/theme";
import { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { Path } from "react-native-svg";
import { SketchCanvas } from "./SketchCanvas";

export interface SketchBoxProps extends ViewProps {
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  roughness?: number;
  seed?: string | number;
  style?: StyleProp<ViewStyle>;
}

/** A container whose border looks drawn by hand. The sketch sits behind the children. */
export const SketchBox = ({
  stroke,
  fill,
  strokeWidth = strokeWidths.regular,
  roughness,
  seed,
  style,
  children,
  ...viewProps
}: SketchBoxProps) => {
  const theme = useTheme();
  const { width, height, onLayout } = useLayoutSize();
  const sketchSeed = useSketchSeed(seed);

  const paths = useMemo(
    () =>
      width && height
        ? sketchRect(width, height, { seed: sketchSeed, roughness })
        : null,
    [width, height, sketchSeed, roughness],
  );

  return (
    <View {...viewProps} style={[styles.container, style]} onLayout={onLayout}>
      {paths && (
        <SketchCanvas width={width} height={height}>
          {fill && <Path d={paths.fill} fill={fill} />}
          <Path
            d={paths.outline}
            stroke={stroke ?? theme.colors.ink}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </SketchCanvas>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: "relative" },
});
