// src/shared/ui/StruckText.tsx
import { useTheme } from "@/shared/theme";
import { ComponentProps, useState } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, TextLayoutEvent, View } from "react-native";
import { NoteText } from "./NoteText";
import { SketchLine } from "./SketchLine";

type StruckTextProps = ComponentProps<typeof NoteText> & {
  struck: boolean;
  strikeColor?: string;
  seed?: string | number;
};

interface TextLine {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Native reports each line via onTextLayout; web doesn't, so there lines are estimated.
const MEASURES_LINES = Platform.OS !== "web";

/** Text that gets crossed out in pen, one stroke per line of text, like a finished to-do. */
export const StruckText = ({
  struck,
  strikeColor,
  seed,
  variant = "body",
  ...textProps
}: StruckTextProps) => {
  const theme = useTheme();
  const [measured, setMeasured] = useState<TextLine[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ width, height });
  };

  const onTextLayout = (e: TextLayoutEvent) =>
    setMeasured(e.nativeEvent.lines.filter((line) => line.text.trim() && line.width > 1));

  // The rendered box is the source of truth for how many lines are showing.
  const lineHeight = theme.text[variant].lineHeight ?? 22;
  const lineCount = Math.max(1, Math.round(box.height / lineHeight));
  const estimated: TextLine[] = Array.from({ length: lineCount }, (_, i) => ({
    x: 0,
    y: i * lineHeight,
    width: box.width,
    height: lineHeight,
  }));

  // Android can fire onTextLayout for an intermediate measuring pass (e.g. at a narrower
  // width), so its lines may not match what's on screen. Only trust them when the line
  // count agrees with the rendered height, and never let a stroke run past the text.
  const measuredMatches = MEASURES_LINES && measured.length === lineCount;
  const lines = !box.width
    ? []
    : measuredMatches
      ? measured.map((line) => ({ ...line, width: Math.min(line.width, box.width - line.x) }))
      : estimated;

  return (
    <View style={styles.wrap}>
      <NoteText
        {...textProps}
        variant={variant}
        onLayout={onLayout}
        onTextLayout={MEASURES_LINES ? onTextLayout : undefined}
      />
      {struck &&
        lines.map((line, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={[
              styles.strike,
              { left: line.x - 2, width: line.width + 4, top: line.y + line.height * 0.55 - 4 },
            ]}
          >
            <SketchLine color={strikeColor} strokeWidth={2.5} seed={`${seed}-${i}`} />
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexShrink: 1 },
  strike: { position: "absolute" },
});
