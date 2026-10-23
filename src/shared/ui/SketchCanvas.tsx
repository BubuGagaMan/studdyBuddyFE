// src/shared/ui/SketchCanvas.tsx
import { SKETCH_PAD } from "@/shared/sketch";
import { ReactNode } from "react";
import Svg, { G } from "react-native-svg";

interface SketchCanvasProps {
  width: number;
  height: number;
  children: ReactNode;
}

/**
 * Absolute SVG layer behind an element, padded on every side so pen strokes that stray
 * past the element's edge aren't clipped. Children draw in the element's own coordinates.
 */
export const SketchCanvas = ({ width, height, children }: SketchCanvasProps) => (
  <Svg
    width={width + SKETCH_PAD * 2}
    height={height + SKETCH_PAD * 2}
    style={{ position: "absolute", top: -SKETCH_PAD, left: -SKETCH_PAD }}
    pointerEvents="none"
  >
    <G transform={`translate(${SKETCH_PAD}, ${SKETCH_PAD})`}>{children}</G>
  </Svg>
);
