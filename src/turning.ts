// Lesson 10's slices of a turning shape: the tesseract (or, one rung down, the cube)
// turned by the six plane sliders and cut where its last coordinate is h. A turned
// corner's last coordinate is the matrix's last row dotted with where the corner
// started, so that row alone decides which starting points the cut keeps: xy, xz and yz
// on their own leave it (0, 0, 0, 1) and only turn the slice.

import { cutCube, turnedCube } from "./cut.ts";
import { AXES, PLANES, rotation, type Angles, type Mat4 } from "./math4d.ts";
import type { Slice } from "./slice.ts";
import { num } from "./ui.ts";

// The turn button's step.
export const STEP = Math.PI / 8;

// All six angles, those not given at 0.
export const angles = (some: Partial<Angles> = {}): Angles => ({ ...(Object.fromEntries(PLANES.map((p) => [p, 0])) as Angles), ...some });

// The n-cube (n = 3 or 4) turned by `some`, cut where coordinate n − 1 is h.
export const turningSlice = (n: number, some: Partial<Angles>, h = 0): Slice => cutCube(n, turnedCube(n, rotation(angles(some))), h);

// The first n entries of `m`'s row n − 1: how a turned point's last coordinate follows
// from the first n coordinates it started with.
export const cutRow = (m: Mat4, n: number): number[] => m.slice((n - 1) * 4, (n - 1) * 4 + n);

// "w′ = 0.71x + 0.71w": the cut's row as a formula, zero terms left out.
export function rowFormula(row: number[]): string {
  const axis = AXES[row.length - 1];
  const terms = row.flatMap((c, k) => {
    const r = Math.round(c * 100) / 100;
    if (r === 0) return [];
    const size = Math.abs(r) === 1 ? "" : num(Math.abs(r));
    return [{ minus: r < 0, text: `${size}${AXES[k]}` }];
  });
  const body = terms.map(({ minus, text }, i) => (i === 0 ? (minus ? "−" : "") + text : `${minus ? "−" : "+"} ${text}`)).join(" ");
  return `${axis}′ = ${body || "0"}`;
}

// A box's or rectangle's size: the lengths of the edges at its first corner, in the
// order of the axes they run most nearly along, so an upright box reads x × y × z.
export function boxSize(s: Slice): number[] {
  return s.edges
    .filter(([a, b]) => a === 0 || b === 0)
    .map(([a, b]) => {
      const d = s.points[a]!.map((x, k) => x - s.points[b]![k]!);
      const along = d.map(Math.abs).reduce((best, x, k, all) => (x > all[best]! + 1e-9 ? k : best), 0);
      return { along, size: Math.round(Math.hypot(...d) * 100) / 100 + 0 };
    })
    .sort((p, q) => p.along - q.along)
    .map(({ size }) => size);
}
