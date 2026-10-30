import assert from "node:assert/strict";
import { test } from "node:test";
import { cutCube, leadTurn, levels, reach, sliceName, snapCut, turnedCube } from "./cut.ts";
import { identity } from "./math4d.ts";

const round = (x: number) => Math.round(x * 1e6) / 1e6 + 0;
const cutAt = (n: number, lead: number, h: number) => cutCube(n, turnedCube(n, leadTurn(n, lead)), h);
const name = (n: number, lead: number, h: number) => sliceName(cutAt(n, lead, h), n);

test("corner first, the last axis's row is the diagonal over its length", () => {
  const m = leadTurn(4, 0);
  assert.deepEqual(m.slice(12).map(round), [0.5, 0.5, 0.5, 0.5]);
  const c = leadTurn(3, 0);
  assert.deepEqual(c.slice(8, 11).map(round), [1, 1, 1].map((x) => round(x / Math.sqrt(3))));
  assert.deepEqual(leadTurn(4, 3), identity());
});

test("edge first, the tesseract's w is (x + y + w) / √3", () => {
  assert.deepEqual(leadTurn(4, 1).slice(12).map(round), [1, 1, 0, 1].map((x) => round(x / Math.sqrt(3))));
});

test("the corners' levels: corner first on the cube ±√3 and ±1/√3, on the tesseract −2 to 2", () => {
  assert.deepEqual(levels(turnedCube(3, leadTurn(3, 0)), 3).map(round), [-Math.sqrt(3), -1 / Math.sqrt(3), 1 / Math.sqrt(3), Math.sqrt(3)].map(round));
  assert.deepEqual(levels(turnedCube(4, leadTurn(4, 0)), 4), [-2, -1, 0, 1, 2]);
  assert.deepEqual(levels(turnedCube(2, identity()), 2), [-1, 1]);
  assert.equal(reach(4, 0), 2);
});

test("the segment cut by a point: a point inside, nothing past the end", () => {
  assert.deepEqual(cutAt(1, 0, 0.4).points.map((p) => p.map(round)), [[0.4, 0, 0]]);
  assert.equal(name(1, 0, 0.4), "point");
  assert.equal(name(1, 0, 1), "point");
  assert.equal(name(1, 0, 1.2), "nothing");
});

test("the square straight on: a segment of length 2 at every height, also on a side", () => {
  for (const h of [-1, -0.3, 0.7, 1]) {
    const s = cutAt(2, 1, h);
    assert.equal(sliceName(s, 2), "segment");
    assert.equal(round(Math.hypot(...s.points[0]!.map((x, k) => x - s.points[1]![k]!))), 2);
  }
});

test("the cube straight on: a square, the same at every height", () => {
  for (const h of [-1, 0, 0.5, 1]) assert.equal(name(3, 2, h), "four-sided");
  assert.equal(name(3, 2, 1.1), "nothing");
});

test("the cube corner first: triangle, hexagon, triangle", () => {
  assert.equal(name(3, 0, -1.7), "triangle");
  assert.equal(name(3, 0, -1 / Math.sqrt(3)), "triangle");
  assert.equal(name(3, 0, -0.3), "hexagon");
  assert.equal(name(3, 0, 0), "hexagon");
  assert.equal(name(3, 0, 1.2), "triangle");
  assert.equal(name(3, 0, -Math.sqrt(3)), "point");
});

test("the cube corner first: the middle hexagon is regular, side √2", () => {
  const s = cutAt(3, 0, 0);
  const [face] = s.faces;
  const sides = face!.map((a, k) => {
    const [p, q] = [s.points[a]!, s.points[face![(k + 1) % 6]!]!];
    return round(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]));
  });
  assert.deepEqual(sides, Array(6).fill(round(Math.SQRT2)));
});

test("the cube edge first: a four-sided slice that grows then shrinks", () => {
  assert.equal(name(3, 1, -1), "four-sided");
  assert.equal(name(3, 1, 0), "four-sided");
});

test("the tesseract straight on: a box with six squares", () => {
  assert.equal(name(4, 3, 0), "box: 6 four-sided faces");
  assert.equal(name(4, 3, 1.2), "nothing");
});

test("the tesseract corner first: tetrahedron, truncated, octahedron", () => {
  assert.equal(name(4, 0, -1.5), "tetrahedron: 4 triangles");
  assert.equal(name(4, 0, -1), "tetrahedron: 4 triangles");
  assert.equal(name(4, 0, -0.5), "solid: 4 triangles, 4 hexagons");
  assert.equal(name(4, 0, 0), "octahedron: 8 triangles");
  assert.equal(name(4, 0, 1.5), "tetrahedron: 4 triangles");
});

test("the slider snaps to 0 and to corner levels", () => {
  assert.equal(snapCut(0.015, [-1, 1]), 0);
  assert.equal(snapCut(-0.99, [-1, 1]), -1);
  assert.equal(snapCut(0.5, [-1, 1]), 0.5);
});
