import assert from "node:assert/strict";
import { test } from "node:test";
import { HEIGHT, thumbnail, WIDTH } from "./thumb.ts";
import { STEP, turningSlice } from "./turning.ts";

const corners = (svg: string) =>
  [...svg.matchAll(/points="([^"]+)"/g)].flatMap((m) => m[1]!.split(" ").map((p) => p.split(",").map(Number) as [number, number]));
const width = (svg: string) => {
  const xs = corners(svg).map(([x]) => x);
  return Math.max(...xs) - Math.min(...xs);
};

test("a box's thumbnail has one filled polygon per face, all inside the picture", () => {
  const svg = thumbnail(turningSlice(4, { xw: 2 * STEP }), 0, "a long box");
  assert.equal(svg.match(/<polygon /g)!.length, 6);
  assert.ok(svg.includes("<title>a long box</title>"));
  for (const [x, y] of corners(svg)) assert.ok(x > 0 && x < WIDTH && y > 0 && y < HEIGHT, `${x},${y}`);
});

test("every thumbnail shares one scale, so the longer box draws wider", () => {
  assert.ok(width(thumbnail(turningSlice(4, { xw: 2 * STEP }), 0, "")) > width(thumbnail(turningSlice(4, {}), 0, "")) + 10);
});
