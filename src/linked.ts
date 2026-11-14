// Lesson 12's links: one turn drives every view of the n-cube. The shadow and the slice
// follow all of the rung's planes. The net is laid out in the space one dimension down,
// so it follows only the planes that leave the last axis alone (none on the square, xy
// on the cube, xy, xz and yz on the tesseract), as in the sandbox. On the lower rungs
// the shadow is cast straight along the last axis onto a screen, as in lesson 7 (in
// perspective, the turned cube's shadow grows past the view).

import { AXES, PLANES, rotation, type Angles, type Mat4, type Plane, type Vec4 } from "./math4d.ts";
import { sliceName } from "./cut.ts";
import { cast } from "./shadow.ts";
import type { Slice } from "./slice.ts";
import { boxSize } from "./turning.ts";
import { num } from "./ui.ts";

// Where the lower rungs' screen stands along the last axis, just behind the shape.
export const SCREEN = -1.5;

// The planes of the n-cube's space, in the course's fixed order.
export const rungPlanes = (n: number): Plane[] => PLANES.filter((p) => [...p].every((a) => AXES.indexOf(a as (typeof AXES)[number]) < n));

// The planes the net turns in: those without the last axis.
export const netPlanes = (n: number): Plane[] => rungPlanes(n).filter((p) => !p.includes(AXES[n - 1]!));

// The net's turn: `angles` with every plane but the net's at 0.
export function netTurn(angles: Angles, n: number): Mat4 {
  const keep = netPlanes(n);
  return rotation(Object.fromEntries(Object.entries(angles).map(([p, x]) => [p, keep.includes(p as Plane) ? x : 0])) as Angles);
}

// A turned corner's shadow on rung n. The tesseract's is cast along w by the renderer
// itself, so it is left as it is.
export const shadowOf = (v: Vec4, n: number): Vec4 => (n === 4 ? v : cast(v, n - 1, SCREEN, null));

// The slice in words: a segment with its length, a rectangle or box with its size when
// the edges at its first corner meet square (so all its corners do), otherwise the
// point, polygon or solid by its faces; `sliceName`'s "box" (any 6 four-sided faces)
// becomes a solid when it slants.
export function describe(cut: Slice, n: number): string {
  const name = sliceName(cut, n);
  const [p, ...rest] = cut.points;
  if (name === "segment") return `segment ${num(Math.hypot(...p!.map((x, k) => x - rest[0]![k]!)))} long`;
  const square = n === 3 ? name === "four-sided" : name.startsWith("box");
  const from = cut.edges.filter((e) => e.includes(0)).map(([a, b]) => cut.points[a === 0 ? b : a]!.map((x, k) => x - p![k]!));
  const right = from.every((u, i) => from.slice(i + 1).every((v) => Math.abs(u.reduce((s, x, k) => s + x * v[k]!, 0)) < 1e-9));
  if (!square || !right) return name.replace(/^box/, "solid");
  return `${n === 3 ? "rectangle" : "box"} ${boxSize(cut).map(num).join(" × ")}`;
}
