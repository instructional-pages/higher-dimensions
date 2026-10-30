import assert from "node:assert/strict";
import { test } from "node:test";
import { apply, PLANES, planeRotation, rotation, type Vec4 } from "./math4d.ts";
import { corner, inBlock, inOrder, planeCount, planesOf } from "./planes.ts";

const near = (a: Vec4, b: Vec4) => a.forEach((x, k) => assert.ok(Math.abs(x - b[k]!) < 1e-12, `${a} vs ${b}`));
const QUARTER = Math.PI / 2;

test("each rung has one plane per pair of directions: 0, 0, 1, 3, 6", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => planesOf(n)), [[], [], ["xy"], ["xy", "xz", "yz"], ["xy", "xz", "xw", "yz", "yw", "zw"]]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 10].map(planeCount), [0, 0, 1, 3, 6, 10, 45]);
  for (const n of [0, 1, 2, 3, 4]) assert.equal(planesOf(n).length, planeCount(n));
});

test("a plane's matrix is the identity outside its 2×2 block", () => {
  assert.deepEqual(
    corner(planeRotation("xz", QUARTER), 3).map((row) => row.map(Math.round)),
    [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0],
    ],
  );
  const lit = [0, 1, 2].flatMap((r) => [0, 1, 2].filter((c) => inBlock("xz", r, c)).map((c) => `${r}${c}`));
  assert.deepEqual(lit, ["00", "02", "20", "22"]);
  // So xz leaves y alone, whatever the angle.
  assert.equal(apply(planeRotation("xz", 1.2), [0.3, 0.7, 0.4, 0])[1], 0.7);
});

test("xy then xz takes (1, 0, 0) to (0, 1, 0); xz then xy takes it to (0, 0, 1)", () => {
  const xyFirst = inOrder([["xy", QUARTER], ["xz", QUARTER]]);
  const xzFirst = inOrder([["xz", QUARTER], ["xy", QUARTER]]);
  near(apply(xyFirst, [1, 0, 0, 0]), [0, 1, 0, 0]);
  near(apply(xzFirst, [1, 0, 0, 0]), [0, 0, 1, 0]);
  assert.notDeepEqual(corner(xyFirst, 3).flat().map(Math.round), corner(xzFirst, 3).flat().map(Math.round));
});

test("the sliders' fixed order is inOrder in the panel's order", () => {
  const angles = { xy: 0.4, xz: 1.1, yz: -0.7, xw: 0, yw: 0, zw: 0 };
  const fixed = rotation(angles);
  const steps = PLANES.map((p) => [p, angles[p]] as [(typeof PLANES)[number], number]);
  inOrder(steps).forEach((x, k) => assert.ok(Math.abs(x - fixed[k]!) < 1e-12));
});
