import assert from "node:assert/strict";
import { test } from "node:test";
import type { Vec4 } from "./math4d.ts";
import { angleName, arc, snapAngle, turn } from "./turn.ts";

const near = (a: Vec4, b: Vec4) => a.forEach((x, k) => assert.ok(Math.abs(x - b[k]!) < 1e-12, `${a} vs ${b}`));

test("the slider snaps onto multiples of π/4 only when close", () => {
  assert.equal(snapAngle(1.57), Math.PI / 2);
  assert.equal(snapAngle(1.59), Math.PI / 2);
  assert.equal(snapAngle(6.28), 2 * Math.PI);
  assert.equal(snapAngle(0.01), 0);
  assert.equal(snapAngle(1.2), 1.2);
  assert.equal(snapAngle(1.6), 1.6);
});

test("multiples of π/4 are named in lowest terms, other angles as decimals", () => {
  const names = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => angleName((k * Math.PI) / 4));
  assert.deepEqual(names, ["0", "π/4", "π/2", "3π/4", "π", "5π/4", "3π/2", "7π/4", "2π"]);
  assert.equal(angleName(1.2), "1.20");
});

test("a quarter turn takes (1, 0) to (0, 1), and the square's other corners along", () => {
  near(turn(Math.PI / 2, [1, 0, 0, 0]), [0, 1, 0, 0]);
  near(turn(Math.PI / 2, [1, 1, 0, 0]), [-1, 1, 0, 0]);
  near(turn(Math.PI / 2, [0, 1, 0, 0]), [-1, 0, 0, 0]);
  near(turn(Math.PI / 4, [1, 0, 0, 0]), [Math.SQRT1_2, Math.SQRT1_2, 0, 0]);
  near(turn(2 * Math.PI, [1, 1, 0, 0]), [1, 1, 0, 0]);
});

test("the arc runs from the corner to its turned place, staying at its distance", () => {
  const path = arc(Math.PI / 2, [1, 0, 0, 0], 8);
  assert.equal(path.length, 8);
  near(path[0]![0], [1, 0, 0, 0]);
  near(path[7]![1], [0, 1, 0, 0]);
  path.forEach(([a, b], i) => {
    assert.ok(Math.abs(Math.hypot(...a) - 1) < 1e-12);
    if (i + 1 < path.length) near(path[i + 1]![0], b);
  });
  assert.deepEqual(arc(0, [1, 0, 0, 0], 2), [
    [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
    [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
  ]);
});
