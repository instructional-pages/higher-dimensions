import assert from "node:assert/strict";
import { test } from "node:test";
import { identity } from "./math4d.ts";
import { COOL, WARM, camera, css, tint, toScreen } from "./render.ts";

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

test("the tint runs from cool at w = -1 to warm at w = 1, clamped beyond", () => {
  assert.deepEqual(tint(-1), COOL);
  assert.deepEqual(tint(1), WARM);
  assert.deepEqual(tint(5), WARM);
  const mid = tint(0);
  for (let k = 0; k < 3; k++) assert.ok(Math.abs(mid[k]! - (COOL[k]! + WARM[k]!) / 2) < 1e-12);
});

test("css writes 0–1 RGB as a CSS color", () => {
  assert.equal(css([1, 0.5, 0]), "rgb(255 128 0)");
});
