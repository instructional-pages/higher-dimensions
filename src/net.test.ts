import assert from "node:assert/strict";
import { test } from "node:test";
import { tesseract, type Shape, type Vec4 } from "./math4d.ts";
import { net, order } from "./net.ts";

const round = (v: Vec4) => v.map((x) => Math.round(x * 1e9) / 1e9 + 0);
const corners = (s: Shape, cell: number[]) => cell.map((i) => round(s.vertices[i]!).join()).sort();
// Each cube's lowest and highest coordinate on each axis.
const box = (s: Shape, cell: number[]) =>
  [Math.min, Math.max].map((f) => [0, 1, 2, 3].map((k) => f(...cell.map((i) => round(s.vertices[i]!)[k]!))));
const squares = (s: Shape) => s.faces.map((f) => f.map((i) => round(s.vertices[i]!).join()).sort().join(";"));

test("the net has 8 cubes, each with 8 corners, 12 edges and 6 squares", () => {
  const n = net(0.3);
  assert.equal(n.cells.length, 8);
  assert.deepEqual([n.vertices.length, n.edges.length, n.faces.length], [64, 96, 48]);
});

test("folded, the cubes are the tesseract's 8 cells", () => {
  const n = net(1);
  const t = tesseract();
  assert.deepEqual(n.cells.map((c) => corners(n, c)), t.cells.map((c) => corners(t, c)));
});

test("folded, every square of every cube is glued to exactly one other cube", () => {
  const all = squares(net(1));
  for (const key of all) assert.equal(all.filter((k) => k === key).length, 2);
});

test("flat, the net is the cross of cubes in the hyperplane w = 1", () => {
  const n = net(0);
  for (const v of n.vertices) assert.equal(round(v)[3], 1);
  const boxes = n.cells.map((c) => box(n, c).map((end) => end.slice(0, 3)));
  assert.deepEqual(boxes, [
    [[-3, -1, -1], [-1, 1, 1]], // x = −1, beside the base
    [[1, -1, -1], [3, 1, 1]], // x = +1
    [[-1, -3, -1], [1, -1, 1]], // y = −1, below the base
    [[-1, 1, -1], [1, 3, 1]], // y = +1, on top: the column's first cube
    [[-1, -1, -3], [1, 1, -1]], // z = −1
    [[-1, -1, 1], [1, 1, 3]], // z = +1
    [[-1, -5, -1], [1, -3, 1]], // w = −1, the column's last cube
    [[-1, -1, -1], [1, 1, 1]], // w = +1, the base: the column's second cube
  ]);
});

test("flat, the cubes only touch at the 7 hinge squares", () => {
  const all = squares(net(0));
  const shared = all.filter((k, i) => all.indexOf(k) !== i);
  assert.equal(shared.length, 7);
  assert.equal(new Set(shared).size, 7);
});

test("mid-fold, every cube stays a cube with edges of length 2", () => {
  for (const fold of [0.1, 0.5, 0.77]) {
    const n = net(fold);
    for (const [a, b] of n.edges) {
      const [p, q] = [n.vertices[a]!, n.vertices[b]!];
      assert.ok(Math.abs(Math.hypot(...p.map((x, k) => x - q[k]!)) - 2) < 1e-9);
    }
  }
});

test("while folding, the cubes leave w = 1 toward −w and stay clear of the viewer", () => {
  for (let fold = 0; fold <= 1; fold += 0.05) {
    const ws = net(fold).vertices.map((v) => v[3]);
    assert.ok(Math.max(...ws) <= 1 + 1e-9);
    // The last cube swings out furthest, to about w = −2.52, far from the viewer at w = 3.
    assert.ok(Math.min(...ws) > -2.53);
  }
  // Half-folded, its far corner is at w = 1 − 2 cos 45° (1 + 2 sin 45°) = −1 − √2.
  const half = net(0.5).vertices.map((v) => v[3]);
  assert.ok(Math.abs(Math.min(...half) - (-Math.SQRT2 - 1)) < 1e-9);
});

test("flat, the square's net is 4 segments in a line along y = 1, read left to right", () => {
  const n = net(0, 2);
  assert.deepEqual([n.cells.length, n.edges.length, n.faces.length], [4, 4, 0]);
  const spans = order(2).map((c) => box(n, n.cells[c]!).map((end) => end.slice(0, 2)));
  assert.deepEqual(spans, [
    [[-5, 1], [-3, 1]], // y = −1, hinged on the far end of x = −1
    [[-3, 1], [-1, 1]], // x = −1
    [[-1, 1], [1, 1]], // y = +1, the base
    [[1, 1], [3, 1]], // x = +1
  ]);
});

test("flat, the cube's net is the cross of 6 squares in z = 1, the column read top down", () => {
  const n = net(0, 3);
  assert.deepEqual([n.cells.length, n.edges.length, n.faces.length], [6, 24, 6]);
  const spans = order(3).map((c) => box(n, n.cells[c]!).map((end) => end.slice(0, 3)));
  assert.deepEqual(spans, [
    [[-1, 1, 1], [1, 3, 1]], // y = +1, the top
    [[-1, -1, 1], [1, 1, 1]], // z = +1, the base
    [[-1, -3, 1], [1, -1, 1]], // y = −1
    [[-1, -5, 1], [1, -3, 1]], // z = −1
    [[-3, -1, 1], [-1, 1, 1]], // x = −1
    [[1, -1, 1], [3, 1, 1]], // x = +1
  ]);
});

test("folded, the lower nets are the square's sides and the cube's faces, each side glued to one other piece", () => {
  for (const d of [2, 3]) {
    const n = net(1, d);
    // A piece's sides are its corners (square) or its edges (cube).
    const sides = d === 2 ? n.vertices.map((v) => round(v).join()) : n.edges.map(([a, b]) => [a, b].map((i) => round(n.vertices[i]!).join()).sort().join(";"));
    for (const key of sides) assert.equal(sides.filter((k) => k === key).length, 2);
    for (const v of n.vertices) assert.ok(round(v).every((x, k) => (k < d ? Math.abs(x) === 1 : x === 0)));
  }
});

test("the tesseract's cubes in reading order: the column, then the sides", () => {
  const n = net(0);
  const centres = order(4).map((c) => [0, 1, 2].map((k) => n.cells[c]!.reduce((s, i) => s + n.vertices[i]![k]!, 0) / 8 + 0));
  assert.deepEqual(centres, [[0, 2, 0], [0, 0, 0], [0, -2, 0], [0, -4, 0], [-2, 0, 0], [2, 0, 0], [0, 0, -2], [0, 0, 2]]);
});

test("in each net, the first piece in reading order is opposite the third", () => {
  for (const d of [2, 3, 4]) {
    const [first, , third] = order(d);
    assert.equal(first! >> 1, third! >> 1);
    assert.notEqual(first, third);
  }
});
