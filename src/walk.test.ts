import assert from "node:assert/strict";
import { test } from "node:test";
import { onRung, walk } from "./walk.ts";

test("onRung keeps only the rung's coordinates", () => {
  assert.deepEqual(onRung([1, 2, 3, 4], 2), [1, 2, 0, 0]);
  assert.deepEqual(onRung([1, 2, 3, 4], 0), [0, 0, 0, 0]);
  assert.deepEqual(onRung([1, 2, 3, 4], 4), [1, 2, 3, 4]);
});

test("the walk steps along each axis in turn", () => {
  assert.deepEqual(walk([0.5, -1, 0.25, 1], 4), [
    [
      [0, 0, 0, 0],
      [0.5, 0, 0, 0],
    ],
    [
      [0.5, 0, 0, 0],
      [0.5, -1, 0, 0],
    ],
    [
      [0.5, -1, 0, 0],
      [0.5, -1, 0.25, 0],
    ],
    [
      [0.5, -1, 0.25, 0],
      [0.5, -1, 0.25, 1],
    ],
  ]);
});

test("zero coordinates and axes past the rung add no step", () => {
  assert.deepEqual(walk([0, 1, 0, 1], 2), [
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
    ],
  ]);
  assert.deepEqual(walk([1, 1, 1, 1], 0), []);
});
