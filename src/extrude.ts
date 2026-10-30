// Lesson 2's picture of building by extrusion: on rung n, the (n − 1)-cube (corners
// every list of 0s and 1s) is the old copy, a copy of it pushed `t` along axis n is the
// new copy, and each old corner is joined to its copy. At t = 1 that is the n-cube.

import type { Vec4 } from "./math4d.ts";

export type Group = "old" | "new" | "link";

export type Square = [number, number, number, number];

export interface Extrusion {
  // The old copy's corners first, then the new copy's in the same order.
  corners: Vec4[];
  edges: { a: number; b: number; group: Group }[];
  // Squares, corners in order around them: the copies' squares, then one swept by each
  // old edge.
  faces: { corners: Square; group: Group }[];
}

// The (k)-cube's corners in the first k coordinates, the rest 0, in binary order with
// the first coordinate changing fastest; edges join corners differing in one coordinate,
// squares those differing in two.
function cube(k: number): { corners: Vec4[]; edges: [number, number][]; faces: Square[] } {
  const corners: Vec4[] = [];
  for (let i = 0; i < 2 ** k; i++) corners.push([0, 1, 2, 3].map((j) => (j < k ? (i >> j) & 1 : 0)) as Vec4);
  const edges: [number, number][] = [];
  for (let i = 0; i < corners.length; i++)
    for (let j = 0; j < k; j++) if (!((i >> j) & 1)) edges.push([i, i | (1 << j)]);
  const faces: Square[] = [];
  for (let i = 0; i < corners.length; i++)
    for (let j = 0; j < k; j++)
      for (let l = j + 1; l < k; l++)
        if (!((i >> j) & 1) && !((i >> l) & 1)) faces.push([i, i | (1 << j), i | (1 << j) | (1 << l), i | (1 << l)]);
  return { corners, edges, faces };
}

// Rung 0 is a lone point. Rung n ≥ 1 drags the (n − 1)-cube `t` (0 to 1) along axis n.
export function extrude(rung: number, t: number): Extrusion {
  if (rung === 0) return { corners: [[0, 0, 0, 0]], edges: [], faces: [] };
  const base = cube(rung - 1);
  const n = base.corners.length;
  const pushed = base.corners.map((c) => c.map((x, j) => (j === rung - 1 ? t : x)) as Vec4);
  return {
    corners: [...base.corners, ...pushed],
    edges: [
      ...base.edges.map(([a, b]) => ({ a, b, group: "old" as const })),
      ...base.edges.map(([a, b]) => ({ a: a + n, b: b + n, group: "new" as const })),
      ...base.corners.map((_, i) => ({ a: i, b: i + n, group: "link" as const })),
    ],
    faces: [
      ...base.faces.map((f) => ({ corners: f, group: "old" as const })),
      ...base.faces.map((f) => ({ corners: f.map((i) => i + n) as Square, group: "new" as const })),
      ...base.edges.map(([a, b]) => ({ corners: [a, b, b + n, a + n] as Square, group: "link" as const })),
    ],
  };
}

// The segment from `from` to `to` as dashes, `period` long each with a gap of the same
// length after it; the last dash is cut short at `to`.
export function dashes(from: Vec4, to: Vec4, period: number): [Vec4, Vec4][] {
  const length = Math.hypot(...to.map((x, k) => x - from[k]!));
  const at = (s: number) => from.map((x, k) => x + (to[k]! - x) * (s / length)) as Vec4;
  const out: [Vec4, Vec4][] = [];
  for (let s = 0; s < length; s += 2 * period) out.push([at(s), at(Math.min(s + period, length))]);
  return out;
}
