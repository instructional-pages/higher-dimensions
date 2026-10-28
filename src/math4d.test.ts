import assert from "node:assert/strict";
import { test } from "node:test";
import {
  apply,
  identity,
  multiply,
  planeRotation,
  projectW,
  rotation,
  tesseract,
  type Angles,
  type Vec4,
} from "./math4d.ts";

const zero: Angles = { xy: 0, xz: 0, yz: 0, xw: 0, yw: 0, zw: 0 };

// Rounds away floating-point noise such as cos(π/2) = 6e-17.
const round = (v: number[]) => v.map((x) => Math.round(x * 1e9) / 1e9 + 0);

test("a quarter turn in xy sends (1, 0) to (0, 1)", () => {
  assert.deepEqual(round(apply(planeRotation("xy", Math.PI / 2), [1, 0, 0, 0])), [0, 1, 0, 0]);
});

test("a plane rotation leaves the other two axes alone", () => {
  const m = planeRotation("xy", 0.7);
  assert.deepEqual(apply(m, [0, 0, 3, -2]), [0, 0, 3, -2]);
});

test("the xw block sits in rows and columns x and w", () => {
  const c = Math.cos(1);
  const s = Math.sin(1);
  assert.deepEqual(planeRotation("xw", 1), [c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c]);
});

test("all angles zero gives the identity", () => {
  assert.deepEqual(rotation(zero), identity());
});

test("rotations apply in the fixed order, xy before xz", () => {
  // Lesson 6: xy by π/2 then xz by π/2 sends (1, 0, 0) to (0, 1, 0).
  const m = rotation({ ...zero, xy: Math.PI / 2, xz: Math.PI / 2 });
  assert.deepEqual(round(apply(m, [1, 0, 0, 0])), [0, 1, 0, 0]);
  // The other order lands on (0, 0, 1): rotations in different planes don't commute.
  const swapped = multiply(planeRotation("xy", Math.PI / 2), planeRotation("xz", Math.PI / 2));
  assert.deepEqual(round(apply(swapped, [1, 0, 0, 0])), [0, 0, 1, 0]);
});

test("a quarter turn in xw sends +x to +w", () => {
  // Lesson 8: the cube that faced +x ends up nearest the viewer, on the outside.
  const m = rotation({ ...zero, xw: Math.PI / 2 });
  assert.deepEqual(round(apply(m, [1, 0, 0, 0])), [0, 0, 0, 1]);
});

test("a full turn in every plane returns every point", () => {
  const m = rotation({ xy: 2 * Math.PI, xz: 2 * Math.PI, yz: 2 * Math.PI, xw: 2 * Math.PI, yw: 2 * Math.PI, zw: 2 * Math.PI });
  assert.deepEqual(round(apply(m, [1, -1, 1, -1])), [1, -1, 1, -1]);
});

test("rotation keeps lengths", () => {
  const m = rotation({ xy: 0.3, xz: 1.1, yz: -0.4, xw: 2.2, yw: 0.9, zw: 5 });
  const v = apply(m, [1, -1, 1, 1]);
  assert.equal(Math.round(Math.hypot(...v) * 1e9) / 1e9, 2);
});

test("perspective along w scales by d / (d − w)", () => {
  // Viewer at w = 3: the far cube (w = −1) shrinks to 3/4, the near one (w = 1) grows to 3/2.
  assert.deepEqual(projectW([1, 1, 1, -1], 3), [0.75, 0.75, 0.75]);
  assert.deepEqual(projectW([1, 1, 1, 1], 3), [1.5, 1.5, 1.5]);
  assert.deepEqual(projectW([2, 0, -2, 0], 3), [2, 0, -2]);
});

test("the tesseract has 16 corners, 32 edges and 24 squares", () => {
  const { vertices, edges, faces } = tesseract();
  assert.equal(vertices.length, 16);
  assert.equal(edges.length, 32);
  assert.equal(faces.length, 24);
  assert.equal(new Set(vertices.map((v) => v.join())).size, 16);
});

test("every edge has length 2 and every square has sides of length 2", () => {
  const { vertices, edges, faces } = tesseract();
  const dist = (i: number, j: number) => {
    const p = vertices[i] as Vec4;
    const q = vertices[j] as Vec4;
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2], p[3] - q[3]);
  };
  for (const [i, j] of edges) assert.equal(dist(i, j), 2);
  for (const f of faces) for (let k = 0; k < 4; k++) assert.equal(dist(f[k]!, f[(k + 1) % 4]!), 2);
});

test("the tesseract has 8 cubic cells, one per side of each axis", () => {
  const { vertices, cells } = tesseract();
  assert.equal(cells.length, 8);
  for (const cell of cells) {
    assert.equal(cell.length, 8);
    // One coordinate is the same at every corner of the cell.
    assert.equal([0, 1, 2, 3].filter((k) => new Set(cell.map((i) => vertices[i]![k])).size === 1).length, 1);
  }
});
