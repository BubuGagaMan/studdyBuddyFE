// src/shared/sketch/shapes.ts
import { createRng, jitter } from "./random";
import { Point, smoothPath } from "./smoothPath";

export interface SketchOptions {
  seed: number;
  roughness?: number; // max wobble in px on a long edge
}

/**
 * Extra canvas around a sketched shape. Pen wobble and overshoot can stray a few px
 * outside the element's box, so the SVG is drawn this much larger on every side.
 */
export const SKETCH_PAD = 8;

// edges shorter than this get proportionally less wobble, so small boxes stay crisp
const FULL_WOBBLE_LENGTH = 160;

// spread a few points along a segment, bowing gently perpendicular to it
const wobblyEdge = (
  from: Point,
  to: Point,
  rng: () => number,
  roughness: number,
  step = 70,
): Point[] => {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(dx, dy) || 1;
  const count = Math.max(1, Math.round(length / step));
  const [nx, ny] = [-dy / length, dx / length];
  const amount = roughness * Math.min(1, length / FULL_WOBBLE_LENGTH);

  const points: Point[] = [from];
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const offset = jitter(rng, amount);
    points.push([from[0] + dx * t + nx * offset, from[1] + dy * t + ny * offset]);
  }
  return points;
};

const fmt = (n: number) => n.toFixed(1);

// one pen stroke from a to b, bowing slightly to one side (quadratic curve)
const bowedEdge = (a: Point, b: Point, rng: () => number, roughness: number) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const length = Math.hypot(dx, dy) || 1;
  const bow = jitter(rng, roughness) * Math.min(1, length / FULL_WOBBLE_LENGTH);
  const t = 0.4 + rng() * 0.2; // bow peak isn't always dead centre
  const cx = a[0] + dx * t + (-dy / length) * bow;
  const cy = a[1] + dy * t + (dx / length) * bow;
  return ` Q${fmt(cx)},${fmt(cy)} ${fmt(b[0])},${fmt(b[1])}`;
};

/**
 * Hand-drawn rectangle: four gently bowed strokes with crisp corners. Returns an outline
 * that overshoots its starting corner like a real pen stroke, plus the same shape closed
 * for the fill, so fill and outline always line up.
 */
export const sketchRect = (
  width: number,
  height: number,
  { seed, roughness = 2.4 }: SketchOptions,
  inset = 2,
) => {
  const rng = createRng(seed);
  const cornerJitter = Math.min(roughness * 0.5, width / 40, height / 20);
  const corner = (x: number, y: number): Point => [
    x + jitter(rng, cornerJitter),
    y + jitter(rng, cornerJitter),
  ];

  const [l, t, r, b] = [inset, inset, width - inset, height - inset];
  const c = [corner(l, t), corner(r, t), corner(r, b), corner(l, b)];

  const start = `M${fmt(c[0][0])},${fmt(c[0][1])}`;
  const edges = c.map((p, i) => bowedEdge(p, c[(i + 1) % 4], rng, roughness)).join("");

  // overshoot: the pen carries on a little past where it started (shorter on small boxes)
  const overshoot = Math.min(8, width * 0.12);
  const tail = ` L${fmt(c[0][0] + overshoot)},${fmt(c[0][1] + jitter(rng, cornerJitter))}`;

  return {
    outline: start + edges + tail,
    fill: `${start}${edges} Z`,
  };
};

/** Hand-drawn horizontal line (underlines, dividers). */
export const sketchLine = (
  width: number,
  y: number,
  { seed, roughness = 0.7 }: SketchOptions,
) => {
  const rng = createRng(seed);
  const start: Point = [jitter(rng, 1.5), y + jitter(rng, roughness)];
  const end: Point = [width - Math.abs(jitter(rng, 3)), y + jitter(rng, roughness)];

  return smoothPath([...wobblyEdge(start, end, rng, roughness, 90), end]);
};

/** Hand-drawn circle, drawn as slightly more than one loop. */
export const sketchCircle = (
  size: number,
  { seed, roughness = 0.8 }: SketchOptions,
  inset = 3,
) => {
  const rng = createRng(seed);
  const center = size / 2;
  const radius = size / 2 - inset;
  const start = rng() * Math.PI * 2;
  const steps = 10;
  const turns = 1.08;

  const points: Point[] = [];
  for (let i = 0; i <= steps * turns; i++) {
    const angle = start + (i / steps) * Math.PI * 2;
    const r = radius + jitter(rng, roughness);
    points.push([center + Math.cos(angle) * r, center + Math.sin(angle) * r]);
  }
  return smoothPath(points);
};

/** Hand-drawn tick mark inside a square of the given size. */
export const sketchTick = (size: number, { seed, roughness = 0.6 }: SketchOptions) => {
  const rng = createRng(seed);
  const p = (x: number, y: number): Point => [
    size * x + jitter(rng, roughness),
    size * y + jitter(rng, roughness),
  ];
  return smoothPath([p(0.16, 0.52), p(0.4, 0.76), p(0.86, 0.2)]);
};
