// Lesson 9's cuts: the n-cube (corners at ±1) turned by a matrix, cut where its last
// coordinate (x on the segment, y on the square, z on the cube, w on the tesseract) is h.
// A lead turn points a corner or an edge along that axis first, so the same cut meets
// the shape corner-first or edge-first. The tesseract's cut is `slice`; the lower rungs'
// are a point, a segment or one polygon.

import { apply, AXES, identity, multiply, planeRotation, tesseract, type Mat4, type Plane, type Vec3, type Vec4 } from "./math4d.ts";
import { cube } from "./shadow.ts";
import { orderPolygon, slice, type Slice } from "./slice.ts";

const TESSERACT = tesseract();

// The turn that makes the n-cube meet the cut with a piece of dimension `lead` first:
// n − 1 (a whole side, face or cube: straight on), 1 (an edge) or 0 (a corner). Step k
// turns axis k toward the last axis by atan(1 / √(k + 1)), which leaves the last axis's
// row of the matrix (1, …, 1, 0, …, 1) / √(k + 2): a corner's height becomes the sum of
// those coordinates over √(steps + 1).
export function leadTurn(n: number, lead: number): Mat4 {
  let m = identity();
  for (let k = 0; k < n - 1 - lead; k++) m = multiply(planeRotation(`${AXES[k]}${AXES[n - 1]}` as Plane, Math.atan(1 / Math.sqrt(k + 1))), m);
  return m;
}

// How far the shape reaches along the cut's axis once turned by `leadTurn(n, lead)`.
export const reach = (n: number, lead: number): number => Math.sqrt(n - lead);

// The n-cube's corners turned by `m`.
export const turnedCube = (n: number, m: Mat4): Vec4[] => cube(n).vertices.map((v) => apply(m, v));

// The heights of the turned corners along the cut's axis, lowest first, each once. The
// slice changes shape only as the cut passes one of them.
export function levels(corners: Vec4[], n: number): number[] {
  const out: number[] = [];
  for (const h of corners.map((v) => v[n - 1]!).sort((a, b) => a - b)) if (!out.length || h - out.at(-1)! > 1e-9) out.push(h);
  return out.map((h) => Math.round(h * 1e9) / 1e9 + 0);
}

// The n-cube turned to `corners` cut where coordinate n − 1 is h. On the lower rungs the
// slice's points are the first three coordinates of where edges cross the cut: one
// point, two (a segment), or a polygon, its face in order around it.
export function cutCube(n: number, corners: Vec4[], h: number): Slice {
  if (n === 4) return slice(TESSERACT, corners, h);
  const axis = n - 1;
  const points: Vec3[] = [];
  const add = (p: Vec4) => {
    const q: Vec3 = [p[0], p[1], p[2]];
    if (!points.some((r) => Math.hypot(q[0] - r[0], q[1] - r[1], q[2] - r[2]) < 1e-7)) points.push(q);
  };
  const side = (v: Vec4) => (Math.abs(v[axis]! - h) < 1e-9 ? 0 : v[axis]! - h);
  for (const [i, j] of cube(n).edges) {
    const p = corners[i]!;
    const q = corners[j]!;
    const [sp, sq] = [side(p), side(q)];
    if (sp === 0) add(p);
    if (sq === 0) add(q);
    if (sp * sq < 0) add(p.map((x, k) => x + (sp / (sp - sq)) * (q[k]! - x)) as Vec4);
  }
  // A single corner touching the cut is a point, like the segment's.
  if (points.length < 2) return { points, faces: [], edges: [] };
  if (points.length === 2) return { points, faces: [], edges: [[0, 1]] };
  const face = orderPolygon([...points.keys()], points)!;
  return { points, faces: [face], edges: face.map((a, k) => [a, face[(k + 1) % face.length]!] as [number, number]) };
}

const POLYGONS = ["", "point", "segment", "triangle", "four-sided", "pentagon", "hexagon"];

// What the slice is: a point, segment or polygon by its corners, and for a solid its
// faces by their number of sides ("4 triangles, 4 hexagons"), named when it is a
// tetrahedron, an octahedron or a box.
export function sliceName(s: Slice, n: number): string {
  if (n < 4 || s.faces.length < 2) return s.points.length ? POLYGONS[s.points.length] ?? `${s.points.length}-sided` : "nothing";
  const kinds = new Map<number, number>();
  for (const f of s.faces) kinds.set(f.length, (kinds.get(f.length) ?? 0) + 1);
  const list = [...kinds].sort((a, b) => a[0] - b[0]).map(([sides, count]) => `${count} ${plural(POLYGONS[sides] ?? `${sides}-sided`, count)}`);
  const only = (sides: number, count: number) => kinds.size === 1 && kinds.get(sides) === count;
  const name = only(3, 4) ? "tetrahedron" : only(3, 8) ? "octahedron" : only(4, 6) ? "box" : "solid";
  return `${name}: ${list.join(", ")}`;
}

const plural = (word: string, count: number) => (count === 1 ? word : word === "four-sided" ? "four-sided faces" : `${word}s`);

// Where the slider lands: on 0 or a corner's level when within 0.02 of one.
export function snapCut(h: number, at: number[]): number {
  const near = [0, ...at].find((x) => Math.abs(h - x) <= 0.02);
  return near ?? h;
}
