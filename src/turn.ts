// Lesson 5's turning in the xy plane: the angle slider snaps to multiples of π/4 and
// names them, and a turned corner's path is an arc about the origin.

import { apply, planeRotation, type Vec4 } from "./math4d.ts";

const EIGHTH = Math.PI / 4;
// How close the slider must come to a multiple of π/4 to land on it exactly.
const SNAP = 0.02;

// `theta` moved onto the nearest multiple of π/4 when it is within SNAP of one.
export function snapAngle(theta: number): number {
  const k = Math.round(theta / EIGHTH);
  return Math.abs(theta - k * EIGHTH) <= SNAP ? k * EIGHTH : theta;
}

// "0", "π/4", "π/2", "3π/4", "π", … "2π" for exact multiples of π/4, else two decimals.
export function angleName(theta: number): string {
  const k = Math.round(theta / EIGHTH);
  if (Math.abs(theta - k * EIGHTH) > 1e-9) return theta.toFixed(2);
  if (k === 0) return "0";
  // k/4 in lowest terms, as a multiple of π.
  const d = k % 4 === 0 ? 1 : k % 2 === 0 ? 2 : 4;
  const n = (k * d) / 4;
  return `${n === 1 ? "" : n}π${d === 1 ? "" : `/${d}`}`;
}

// `v` turned by θ in xy.
export const turn = (theta: number, v: Vec4): Vec4 => apply(planeRotation("xy", theta), v);

// The path `v` takes as it turns from 0 to θ, as `pieces` segments.
export function arc(theta: number, v: Vec4, pieces: number): [Vec4, Vec4][] {
  const at = (i: number) => turn((theta * i) / pieces, v);
  return [...Array(pieces).keys()].map((i) => [at(i), at(i + 1)]);
}
