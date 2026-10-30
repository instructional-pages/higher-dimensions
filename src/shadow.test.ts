import assert from "node:assert/strict";
import { test } from "node:test";
import { apply, planeRotation, projectW, tesseract } from "./math4d.ts";
import { byLength, cast, cube, extent } from "./shadow.ts";

const near = (a: number[], b: number[]) => a.forEach((x, k) => assert.ok(Math.abs(x - b[k]!) < 1e-12, `${a} vs ${b}`));
const length = (p: number[], q: number[]) => Math.hypot(...p.map((x, k) => x - q[k]!));

test("the n-cube has 2^n corners at ±1 and the counts of lesson 3", () => {
  assert.deepEqual(cube(1).vertices, [[-1, 0, 0, 0], [1, 0, 0, 0]]);
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => [cube(n).vertices.length, cube(n).edges.length, cube(n).faces.length]), [
    [1, 0, 0],
    [2, 1, 0],
    [4, 4, 1],
    [8, 12, 6],
    [16, 32, 24],
  ]);
  const t = tesseract();
  assert.deepEqual(cube(4), { vertices: t.vertices, edges: t.edges, faces: t.faces });
  // Every edge is 2 long.
  for (const n of [1, 2, 3, 4]) for (const [a, b] of cube(n).edges) assert.equal(length(cube(n).vertices[a]!, cube(n).vertices[b]!), 2);
});

test("straight on, a shadow keeps the other coordinates and lands on the screen", () => {
  assert.deepEqual(cast([1, 0, 0, 0], 0, -1.5, null), [-1.5, 0, 0, 0]);
  assert.deepEqual(cast([-1, 0, 0, 0], 0, -1.5, null), [-1.5, 0, 0, 0]);
  assert.deepEqual(cast([1, 1, -1, 0], 2, -1.5, null), [1, 1, -1.5, 0]);
  // The cube face-on: front and back faces cast the same square.
  const shadows = cube(3).vertices.map((v) => cast(v, 2, -1.5, null).join());
  assert.equal(new Set(shadows).size, 4);
});

test("in perspective, nearer the viewer casts bigger: a square inside a square", () => {
  // Viewer at z = 3, screen at z = −1.5: the near face scales by 4.5 / 2, the far by 4.5 / 4.
  near(cast([1, 1, 1, 0], 2, -1.5, 3), [2.25, 2.25, -1.5, 0]);
  near(cast([1, -1, -1, 0], 2, -1.5, 3), [1.125, -1.125, -1.5, 0]);
  // On the screen itself, a point is its own shadow.
  near(cast([0.5, 2, -1.5, 0], 2, -1.5, 3), [0.5, 2, -1.5, 0]);
  const sizes = cube(3).vertices.map((v) => Math.abs(cast(v, 2, -1.5, 3)[0]!));
  assert.deepEqual([...new Set(sizes)].sort(), [1.125, 2.25]);
});

test("a square's shadow on a line grows and shrinks as it turns", () => {
  const shadow = (theta: number) => extent(cube(2).vertices.map((v) => cast(apply(planeRotation("xy", theta), v), 1, -1.5, null)[0]!));
  assert.equal(shadow(0), 2);
  assert.ok(Math.abs(shadow(Math.PI / 4) - 2 * Math.SQRT2) < 1e-12);
  assert.ok(Math.abs(shadow(Math.PI / 2) - 2) < 1e-12);
  assert.equal(extent([3]), 0);
});

test("the tesseract's shadow: all 32 edges are 2 long, but cast 12 short, 12 long and 8 between", () => {
  const t = tesseract();
  const shadows = t.vertices.map((v) => projectW(v, 3));
  const groups = byLength(t.edges.map(([a, b]) => length(shadows[a]!, shadows[b]!)));
  assert.deepEqual(groups.map((g) => g.count), [8, 12, 12]);
  near(groups.map((g) => g.length), [0.75 * Math.sqrt(3), 1.5, 3]);
  assert.deepEqual(byLength([]), []);
});

test("in the shadow the inner cube is the far one, w = −1, and the outer the near, w = 1", () => {
  near(projectW([1, 1, 1, -1], 3), [0.75, 0.75, 0.75]);
  near(projectW([1, 1, 1, 1], 3), [1.5, 1.5, 1.5]);
});
