// The cross-section of a 4D shape by the hyperplane w = h, as small pure functions.
// The slice of a convex shape is a convex 3D polytope: its corners are where the
// shape's edges cross the hyperplane, and each cell the hyperplane cuts through gives
// one polygon face.

import type { Shape, Vec3, Vec4 } from "./math4d.ts";

export interface Slice {
  points: Vec3[];
  // Each face lists point indices in order around the polygon.
  faces: number[][];
  edges: [number, number][];
}

// Distances below this count as zero: a corner this close to the hyperplane lies on it.
const EPS = 1e-9;

// `vertices` are the shape's corners after rotation; `shape` gives the edges and cells.
export function slice(shape: Shape, vertices: Vec4[], h: number): Slice {
  const points: Vec3[] = [];
  const pointOf = (p: Vec3): number => {
    const found = points.findIndex((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-7);
    return found >= 0 ? found : points.push(p) - 1;
  };
  const corner = (i: number): Vec3 => [vertices[i]![0], vertices[i]![1], vertices[i]![2]];
  const side = (i: number) => {
    const d = vertices[i]![3] - h;
    return Math.abs(d) < EPS ? 0 : d;
  };

  // Where each edge meets the hyperplane: one crossing point, a corner lying on it,
  // or both corners when the whole edge lies in it.
  const edgePoints = new Map<string, number[]>();
  for (const [i, j] of shape.edges) {
    const si = side(i);
    const sj = side(j);
    const hits: number[] = [];
    if (si === 0) hits.push(pointOf(corner(i)));
    if (sj === 0) hits.push(pointOf(corner(j)));
    if (si * sj < 0) {
      const t = si / (si - sj);
      const p = corner(i);
      const q = corner(j);
      hits.push(pointOf([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]), p[2] + t * (q[2] - p[2])]));
    }
    edgePoints.set(`${i},${j}`, hits);
  }

  const faces: number[][] = [];
  const seen = new Set<string>();
  for (const cell of shape.cells) {
    const inCell = new Set(cell);
    const ids = new Set<number>();
    for (const [i, j] of shape.edges)
      if (inCell.has(i) && inCell.has(j)) for (const id of edgePoints.get(`${i},${j}`)!) ids.add(id);
    const face = orderPolygon([...ids], points);
    if (!face) continue;
    // Two cells give the same polygon when the hyperplane holds the square they share.
    const key = [...face].sort((a, b) => a - b).join();
    if (!seen.has(key)) faces.push(face), seen.add(key);
  }

  const edgeKeys = new Set<string>();
  const edges: [number, number][] = [];
  for (const face of faces)
    face.forEach((a, k) => {
      const b = face[(k + 1) % face.length]!;
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      if (!edgeKeys.has(key)) edgeKeys.add(key), edges.push(a < b ? [a, b] : [b, a]);
    });

  return { points, faces, edges };
}

// Orders points that span a flat polygon by angle around their centre. Returns null
// when they don't: fewer than three, all on a line, or spread through 3D (a whole
// cell lying in the hyperplane, which is the slice itself, not one of its faces).
export function orderPolygon(ids: number[], points: Vec3[]): number[] | null {
  if (ids.length < 3) return null;
  const ps = ids.map((i) => points[i]!);
  const c = [0, 1, 2].map((k) => ps.reduce((s, p) => s + p[k]!, 0) / ps.length) as Vec3;
  const rel = ps.map((p) => [p[0] - c[0], p[1] - c[1], p[2] - c[2]] as Vec3);

  // The normal is the largest cross product of two spokes from the centre.
  let n: Vec3 = [0, 0, 0];
  let best = 0;
  for (let a = 0; a < rel.length; a++)
    for (let b = a + 1; b < rel.length; b++) {
      const x = cross(rel[a]!, rel[b]!);
      const len = Math.hypot(...x);
      if (len > best) (best = len), (n = x);
    }
  if (best < 1e-9) return null;
  n = n.map((x) => x / best) as Vec3;
  if (rel.some((r) => Math.abs(dot(r, n)) > 1e-7)) return null;

  const u = rel.find((r) => Math.hypot(...r) > 1e-9)!;
  const v = cross(n, u);
  const angle = rel.map((r) => Math.atan2(dot(r, v), dot(r, u)));
  return ids.map((id, k) => [id, angle[k]!] as const).sort((a, b) => a[1] - b[1]).map(([id]) => id);
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
