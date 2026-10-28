// Lesson 1's picture of a point: from the origin, a step along x, then y, then z, then
// w, each as long as that coordinate. On rung n (nD) only the first n axes exist.

import type { Vec4 } from "./math4d.ts";

// The point with every coordinate past the first `rung` set to 0.
export const onRung = (p: Vec4, rung: number): Vec4 => p.map((x, k) => (k < rung ? x : 0)) as Vec4;

// The walk's segments, one per nonzero coordinate on the rung, in axis order.
export function walk(p: Vec4, rung: number): [Vec4, Vec4][] {
  const segments: [Vec4, Vec4][] = [];
  const at: Vec4 = [0, 0, 0, 0];
  for (let k = 0; k < rung; k++) {
    if (p[k] === 0) continue;
    const next = [...at] as Vec4;
    next[k] = p[k]!;
    segments.push([[...at], next]);
    at[k] = p[k]!;
  }
  return segments;
}
