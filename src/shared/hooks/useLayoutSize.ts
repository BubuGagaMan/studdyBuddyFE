// src/shared/hooks/useLayoutSize.ts
import { useCallback, useState } from "react";
import { LayoutChangeEvent } from "react-native";

export const useLayoutSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    // round so sub-pixel layout passes don't regenerate the sketch
    const next = { width: Math.round(width), height: Math.round(height) };
    setSize((prev) =>
      prev.width === next.width && prev.height === next.height ? prev : next,
    );
  }, []);

  return { ...size, onLayout };
};
