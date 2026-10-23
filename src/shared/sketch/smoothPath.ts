// src/shared/sketch/smoothPath.ts

export type Point = [number, number];

const fmt = (n: number) => n.toFixed(1);

/**
 * Turns a list of points into a smooth SVG path (Catmull-Rom converted to cubic beziers),
 * so jittered points read as one continuous pen stroke rather than a zigzag.
 */
export const smoothPath = (points: Point[], closed = false): string => {
  if (points.length < 2) return "";

  const at = (i: number): Point => {
    if (closed) return points[(i + points.length) % points.length];
    return points[Math.max(0, Math.min(points.length - 1, i))];
  };

  const segments = closed ? points.length : points.length - 1;
  let d = `M${fmt(points[0][0])},${fmt(points[0][1])}`;

  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2[0])},${fmt(p2[1])}`;
  }

  return closed ? `${d} Z` : d;
};
