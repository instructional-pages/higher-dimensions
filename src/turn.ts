// Lesson 5's turning in the xy plane: the angle slider snaps to multiples of π/4 and
// names them, and a turned corner's path is an arc about the origin.

import { apply, planeRotation, type Plane, type Vec4 } from "./math4d.ts";

const EIGHTH = Math.PI / 4;
// How close the slider must come to a multiple of π/4 to land on it exactly.
const SNAP = 0.02;

// `theta` moved onto the nearest multiple of π/4 when it is within SNAP of one.
export function snapAngle(theta: number): number {
  const k = Math.round(theta / EIGHTH);
  return Math.abs(theta - k * EIGHTH) <= SNAP ? k * EIGHTH : theta;
}

// "0", "π/8", "π/4", "3π/8", "π/2", … "2π" for exact multiples of π/8 (lesson 10's
// turn button), else two decimals. The sliders move in steps of 0.01, so they land
// exactly only on the multiples of π/4 they snap to.
export function angleName(theta: number): string {
  const k = Math.round(theta / (EIGHTH / 2));
  if (Math.abs(theta - (k * EIGHTH) / 2) > 1e-9) return theta.toFixed(2);
  if (k === 0) return "0";
  // k/8 in lowest terms, as a multiple of π.
  const d = k % 8 === 0 ? 1 : k % 4 === 0 ? 2 : k % 2 === 0 ? 4 : 8;
  const n = (k * d) / 8;
  return `${n === 1 ? "" : n}π${d === 1 ? "" : `/${d}`}`;
}

// `v` turned by θ in xy.
export const turn = (theta: number, v: Vec4): Vec4 => apply(planeRotation("xy", theta), v);

// The path `v` takes as it turns from 0 to θ in `plane`, as `pieces` segments.
export function arc(theta: number, v: Vec4, pieces: number, plane: Plane = "xy"): [Vec4, Vec4][] {
  const at = (i: number) => apply(planeRotation(plane, (theta * i) / pieces), v);
  return [...Array(pieces).keys()].map((i) => [at(i), at(i + 1)]);
}
