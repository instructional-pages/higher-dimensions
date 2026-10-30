// Lesson 6's planes: a turn happens in a plane, one per pair of directions; each plane's
// matrix is lesson 5's 2×2 block in two rows and columns of the identity; and turns in
// different planes give different results in different orders.

import { AXES, identity, multiply, planeRotation, type Mat4, type Plane } from "./math4d.ts";

// The planes of nD space, one per pair of its first n directions (n up to 4): "xy", ….
export function planesOf(n: number): string[] {
  const axes = AXES.slice(0, n);
  return axes.flatMap((a, i) => axes.slice(i + 1).map((b) => a + b));
}

// One plane per pair of directions: n(n − 1)/2, for any n. +0 turns −0 into 0.
export const planeCount = (n: number): number => (n * (n - 1)) / 2 + 0;

// Whether entry (r, c) of a plane's matrix is in its 2×2 block rather than the identity.
export function inBlock(plane: Plane, r: number, c: number): boolean {
  const [a, b] = [AXES.indexOf(plane[0] as (typeof AXES)[number]), AXES.indexOf(plane[1] as (typeof AXES)[number])];
  return (r === a || r === b) && (c === a || c === b);
}

// The turns in `steps` made one after another, the first first: the product with the
// last step's matrix on the left.
export function inOrder(steps: [Plane, number][]): Mat4 {
  return steps.reduce((m, [plane, theta]) => multiply(planeRotation(plane, theta), m), identity());
}

// The top left n×n of a 4×4 matrix, as rows.
export const corner = (m: Mat4, n: number): number[][] =>
  [...Array(n).keys()].map((r) => [...Array(n).keys()].map((c) => m[r * 4 + c]!));
