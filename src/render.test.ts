import assert from "node:assert/strict";
import { test } from "node:test";
import { identity } from "./math4d.ts";
import { camera, toScreen } from "./render.ts";

test("toScreen maps clip space to pixels from the top left", () => {
  assert.deepEqual(toScreen(identity(), [0.5, 0.5, 0], 200, 100), [150, 25]);
  assert.deepEqual(toScreen(identity(), [-1, -1, 0], 200, 100), [0, 100]);
});

test("toScreen divides by the perspective w", () => {
  const halve = identity();
  halve[15] = 2;
  assert.deepEqual(toScreen(halve, [1, 1, 0], 200, 100), [150, 25]);
});

test("the camera looks at the origin, so it lands mid-canvas", () => {
  const [x, y] = toScreen(camera(2, 11), [0, 0, 0], 200, 100);
  assert.ok(Math.abs(x - 100) < 1e-9 && Math.abs(y - 50) < 1e-9);
});
