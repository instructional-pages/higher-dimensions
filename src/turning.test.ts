import assert from "node:assert/strict";
import { test } from "node:test";
import { sliceName } from "./cut.ts";
import { rotation } from "./math4d.ts";
import { angles, cutRow, boxSize, rowFormula, STEP, turningSlice } from "./turning.ts";

test("straight on, the tesseract's slice at w = 0 is the 2 × 2 × 2 cube", () => {
  const s = turningSlice(4, {});
  assert.equal(sliceName(s, 4), "box: 6 four-sided faces");
  assert.deepEqual(boxSize(s), [2, 2, 2]);
});

test("xy, xz and yz leave the cut's row alone, so the slice stays a cube, only turned", () => {
  const some = { xy: 0.5, xz: 1.1, yz: 2 };
  assert.deepEqual(cutRow(rotation(angles(some)), 4).map((c) => Math.round(c * 1e9) / 1e9 + 0), [0, 0, 0, 1]);
  const s = turningSlice(4, some);
  assert.equal(sliceName(s, 4), "box: 6 four-sided faces");
  const lengths = s.edges.map(([a, b]) => Math.hypot(...s.points[a]!.map((x, k) => x - s.points[b]![k]!)));
  for (const l of lengths) assert.ok(Math.abs(l - 2) < 1e-9);
  assert.deepEqual(boxSize(s), [2, 2, 2]);
});

test("a turned box keeps its size: xw at π/4 then yw at π/2 cuts a 2 × 2 × 2 cube", () => {
  assert.deepEqual(boxSize(turningSlice(4, { xw: 2 * STEP, yw: 4 * STEP })), [2, 2, 2]);
  // Turned π/4 in xy, two of its edges run equally along x and y.
  assert.deepEqual(boxSize(turningSlice(4, { xy: 2 * STEP })), [2, 2, 2]);
});

test("xw stretches the slice along x, longest (2√2) at π/4, back to a cube at π/2", () => {
  const along = [0, 1, 2, 3, 4].map((k) => boxSize(turningSlice(4, { xw: k * STEP }))[0]);
  assert.deepEqual(along, [2, 2.16, 2.83, 2.16, 2]);
  assert.deepEqual(boxSize(turningSlice(4, { xw: 2 * STEP })), [2.83, 2, 2]);
});

test("yw and zw do the same along y and z", () => {
  assert.deepEqual(boxSize(turningSlice(4, { yw: 2 * STEP })), [2, 2.83, 2]);
  assert.deepEqual(boxSize(turningSlice(4, { zw: 3 * STEP })), [2, 2, 2.16]);
});

test("a second plane into w tilts the cut against the shape: two hexagons appear", () => {
  assert.equal(sliceName(turningSlice(4, { xw: 2 * STEP, yw: STEP }), 4), "solid: 6 four-sided faces, 2 hexagons");
});

test("one rung down, the cube turning in xz cut by z = 0 gives a rectangle", () => {
  const s = turningSlice(3, { xz: 2 * STEP });
  assert.equal(sliceName(s, 3), "four-sided");
  assert.deepEqual(boxSize(s), [2.83, 2]);
});

test("the cut's row reads as a formula, zero terms left out", () => {
  assert.equal(rowFormula(cutRow(rotation(angles()), 4)), "w′ = w");
  assert.equal(rowFormula(cutRow(rotation(angles({ xw: STEP })), 4)), "w′ = 0.38x + 0.92w");
  assert.equal(rowFormula(cutRow(rotation(angles({ xw: Math.PI / 2 })), 4)), "w′ = x");
  assert.equal(rowFormula(cutRow(rotation(angles({ xw: -Math.PI / 4 })), 4)), "w′ = −0.71x + 0.71w");
  assert.equal(rowFormula(cutRow(rotation(angles({ xz: 2 * STEP })), 3)), "z′ = 0.71x + 0.71z");
});
