// Lesson 7's shadows: a shape seen one dimension down. On the lower rungs its corners are
// cast across one direction onto a flat screen, either straight on (along that direction)
// or in perspective from a viewer on the other side, so nearer is bigger. The tesseract's
// shadow along w is `projectW`'s perspective, with no screen: it is the 3D world itself.

import { AXES, type Mat4, type Vec4 } from "./math4d.ts";

// The n-cube with corners at ±1 in its first n coordinates (the rest 0). Corner i has
// bit k set when coordinate k is +1, as in `tesseract`, so an edge joins corners that
// differ in one bit and a square spans two.
export function cube(n: number): { vertices: Vec4[]; edges: [number, number][]; faces: [number, number, number, number][] } {
  const vertices = [...Array(1 << n).keys()].map((i) => [0, 1, 2, 3].map((k) => (k >= n ? 0 : (i >> k) & 1 ? 1 : -1)) as Vec4);
  const edges: [number, number][] = [];
  const faces: [number, number, number, number][] = [];
  vertices.forEach((_, i) => {
    for (let a = 0; a < n; a++) {
      if (i & (1 << a)) continue;
      edges.push([i, i | (1 << a)]);
      for (let b = a + 1; b < n; b++) if (!(i & (1 << b))) faces.push([i, i | (1 << a), i | (1 << a) | (1 << b), i | (1 << b)]);
    }
  });
  return { vertices, edges, faces };
}

// `v` cast across direction `axis` onto the screen where that coordinate is `screen`:
// straight on when `viewer` is null, otherwise from a viewer where it is `viewer`, which
// scales the other coordinates by (viewer − screen) / (viewer − v[axis]). Points need
// v[axis] < viewer.
export function cast(v: Vec4, axis: number, screen: number, viewer: number | null): Vec4 {
  const k = viewer === null ? 1 : (viewer - screen) / (viewer - v[axis]!);
  return v.map((x, i) => (i === axis ? screen : x * k)) as Vec4;
}

// How far `values` spread, from the smallest to the largest.
export const extent = (values: number[]): number => Math.max(...values) - Math.min(...values);

// The distinct lengths in `lengths`, shortest first, each with how many there are.
export function byLength(lengths: number[]): { length: number; count: number }[] {
  const groups: { length: number; count: number }[] = [];
  for (const length of [...lengths].sort((a, b) => a - b)) {
    const last = groups.at(-1);
    if (last && length - last.length < 1e-9) last.count++;
    else groups.push({ length, count: 1 });
  }
  return groups;
}

// The n-cube's 2n pieces one dimension down (a square's sides, a cube's faces, the
// tesseract's cubes), each holding one coordinate at −1 or +1: piece c holds coordinate
// c >> 1 at bit c & 1, so corner i is in it when that bit of i matches.
export const inPiece = (c: number, i: number): boolean => ((i >> (c >> 1)) & 1) === (c & 1);
export const pieceName = (c: number): string => `${AXES[c >> 1]} = ${c & 1 ? "+1" : "−1"}`;

// The n-cube's pieces nearest a viewer along direction `axis` once turned by `m`: the
// ones whose centre has the largest coordinate there, so they cast the outside of a
// perspective shadow. Two or more when they tie.
export function nearest(m: Mat4, n: number, axis: number): number[] {
  const reach = [...Array(2 * n).keys()].map((c) => m[axis * 4 + (c >> 1)]! * (c & 1 ? 1 : -1));
  const most = Math.max(...reach);
  return reach.flatMap((r, c) => (most - r < 1e-9 ? [c] : []));
}
