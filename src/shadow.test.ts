import assert from "node:assert/strict";
import { test } from "node:test";
import { apply, planeRotation, projectW, tesseract } from "./math4d.ts";
import { byLength, cast, cube, extent, inPiece, nearest, pieceName } from "./shadow.ts";

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

test("each piece holds one coordinate at −1 or +1", () => {
  const t = cube(4);
  for (let c = 0; c < 8; c++) {
    const corners = t.vertices.filter((_, i) => inPiece(c, i));
    assert.equal(corners.length, 8);
    for (const v of corners) assert.equal(v[c >> 1], c & 1 ? 1 : -1);
  }
  assert.deepEqual([0, 1, 6, 7].map(pieceName), ["x = −1", "x = +1", "w = −1", "w = +1"]);
  // A square's sides: 2 corners each.
  assert.deepEqual([0, 1, 2, 3].map((c) => [0, 1, 2, 3].filter((i) => inPiece(c, i))), [[0, 2], [1, 3], [0, 1], [2, 3]]);
});

test("turning xw by π/2 brings the x = +1 cube nearest the viewer along w", () => {
  const xw = (theta: number) => planeRotation("xw", theta);
  assert.deepEqual(nearest(xw(0), 4, 3), [7]);
  assert.deepEqual(nearest(xw(Math.PI / 4), 4, 3), [1, 7]);
  assert.deepEqual(nearest(xw(Math.PI / 2), 4, 3), [1]);
  assert.deepEqual(nearest(xw(Math.PI), 4, 3), [6]);
  assert.deepEqual(nearest(xw((3 * Math.PI) / 2), 4, 3), [0]);
  assert.deepEqual(nearest(xw(2 * Math.PI), 4, 3), [7]);
  // The rungs below: the square in xy along y, the cube in xz along z.
  assert.deepEqual(nearest(planeRotation("xy", Math.PI / 2), 2, 1), [1]);
  assert.deepEqual(nearest(planeRotation("xz", Math.PI / 2), 3, 2), [1]);
  // The nearest cube's corners are the ones with the most w, so it casts the outside.
  const turned = cube(4).vertices.map((v) => apply(xw(Math.PI / 2), v));
  for (const [i, v] of turned.entries()) near([v[3]], [inPiece(1, i) ? 1 : -1]);
  const size = (c: number) => extent(turned.filter((_, i) => inPiece(c, i)).map((v) => projectW(v, 3)[1]));
  assert.ok(size(1) > size(0));
});

test("after a full turn of 2π in xw, every corner is back where it started", () => {
  for (const v of cube(4).vertices) near(apply(planeRotation("xw", 2 * Math.PI), v), v);
});
