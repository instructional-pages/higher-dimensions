import assert from "node:assert/strict";
import { test } from "node:test";
import { canReveal, isRight, parseAnswer } from "./check.ts";

test("parseAnswer reads numbers and rejects the rest", () => {
  assert.equal(parseAnswer(" 4 "), 4);
  assert.equal(parseAnswer("-2.5"), -2.5);
  assert.equal(parseAnswer(""), null);
  assert.equal(parseAnswer("  "), null);
  assert.equal(parseAnswer("four"), null);
});

test("reveal waits for a prediction in every prompt", () => {
  assert.equal(canReveal(["4", ""]), false);
  assert.equal(canReveal(["4", "x"]), false);
  assert.equal(canReveal(["4", "6"]), true);
});

test("isRight compares the typed number with the answer", () => {
  assert.equal(isRight("7", 7), true);
  assert.equal(isRight("7.0", 7), true);
  assert.equal(isRight("6", 7), false);
});
