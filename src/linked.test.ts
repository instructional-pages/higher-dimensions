import assert from "node:assert/strict";
import { test } from "node:test";
import { closedForm } from "./count.ts";
import { sliceName } from "./cut.ts";
import { describe, netPlanes, netTurn, rungPlanes, shadowOf } from "./linked.ts";
import { rotation } from "./math4d.ts";
import { angles, STEP, turningSlice } from "./turning.ts";

const round = (m: number[]) => m.map((x) => Math.round(x * 1e9) / 1e9 + 0);

test("each rung has its planes, and the net only those that keep the last axis", () => {
  assert.deepEqual(rungPlanes(2), ["xy"]);
  assert.deepEqual(rungPlanes(3), ["xy", "xz", "yz"]);
  assert.deepEqual(rungPlanes(4), ["xy", "xz", "yz", "xw", "yw", "zw"]);
  assert.deepEqual(netPlanes(2), []);
  assert.deepEqual(netPlanes(3), ["xy"]);
  assert.deepEqual(netPlanes(4), ["xy", "xz", "yz"]);
});

test("the net's turn drops the planes into the last axis", () => {
  const all = angles({ xy: 0.3, xz: 0.7, yz: 1.1, xw: 0.5, yw: 0.9, zw: 1.3 });
  assert.deepEqual(round(netTurn(all, 4)), round(rotation(angles({ xy: 0.3, xz: 0.7, yz: 1.1 }))));
  assert.deepEqual(round(netTurn(all, 3)), round(rotation(angles({ xy: 0.3 }))));
  assert.deepEqual(round(netTurn(all, 2)), round(rotation(angles())));
});

test("lower rungs cast straight onto the screen at −1.5; the tesseract is left to the renderer", () => {
  assert.deepEqual(shadowOf([1, 1, 0, 0], 2), [1, -1.5, 0, 0]);
  assert.deepEqual(shadowOf([0.5, 1, 1.2, 0], 3), [0.5, 1, -1.5, 0]);
  assert.deepEqual(shadowOf([1, 1, 1, 1], 4), [1, 1, 1, 1]);
});

test("the final round: zw at π/4, then xw at π/4 too, cuts a hexagonal prism running along y", () => {
  assert.equal(sliceName(turningSlice(4, { zw: 2 * STEP }), 4), "box: 6 four-sided faces");
  const s = turningSlice(4, { zw: 2 * STEP, xw: 2 * STEP });
  assert.equal(sliceName(s, 4), "solid: 6 four-sided faces, 2 hexagons");
  // Neither turn touches y, so the hexagons are the ends at y = ±1.
  for (const face of s.faces.filter((f) => f.length === 6)) {
    const ys = face.map((i) => Math.round(s.points[i]![1] * 1e9) / 1e9);
    assert.equal(new Set(ys).size, 1);
    assert.equal(Math.abs(ys[0]!), 1);
  }
  // The distractor, xw and yw at π/4, runs along z instead.
  const other = turningSlice(4, { xw: 2 * STEP, yw: 2 * STEP });
  for (const face of other.faces.filter((f) => f.length === 6)) assert.ok(face.every((i) => Math.abs(Math.abs(other.points[i]![2]) - 1) < 1e-9));
});

test("the count checks: the 5D cube's pieces and the 6D cube's edges", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((k) => closedForm(5, k)), [32, 80, 80, 40, 10]);
  assert.equal(closedForm(6, 1), 192);
});

test("the slice is named a rectangle or box only when its corners are square", () => {
  assert.equal(describe(turningSlice(3, { xz: 2 * STEP }), 3), "rectangle 2.83 × 2");
  assert.equal(describe(turningSlice(4, { xw: 2 * STEP }), 4), "box 2.83 × 2 × 2");
  // A little xz and yz: the cut z = 0 meets the cube aslant in a parallelogram.
  assert.equal(describe(turningSlice(3, { xz: STEP, yz: STEP }), 3), "four-sided");
  // The same one rung up: a slanted prism with 6 four-sided faces, not a box.
  assert.equal(describe(turningSlice(4, { xw: STEP, yw: STEP }), 4), "solid: 6 four-sided faces");
  assert.equal(describe(turningSlice(4, { xw: 2 * STEP, yw: 2 * STEP }), 4), "solid: 6 four-sided faces, 2 hexagons");
});
