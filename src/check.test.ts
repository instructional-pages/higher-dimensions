import assert from "node:assert/strict";
import { test } from "node:test";
import { canReveal, isRight, parseAnswer, type Prompt } from "./check.ts";

const typed = (answer: number): Prompt => ({ label: "4D", answer });
const picked = (answer: string): Prompt => ({ label: "Same cube?", choices: ["yes", "no"], answer });

test("parseAnswer reads numbers and rejects the rest", () => {
  assert.equal(parseAnswer(" 4 "), 4);
  assert.equal(parseAnswer("-2.5"), -2.5);
  assert.equal(parseAnswer(""), null);
  assert.equal(parseAnswer("  "), null);
  assert.equal(parseAnswer("four"), null);
});

test("reveal waits for a prediction in every prompt", () => {
  const two = [typed(4), typed(6)];
  assert.equal(canReveal(two, ["4", ""]), false);
  assert.equal(canReveal(two, ["4", "x"]), false);
  assert.equal(canReveal(two, ["4", "6"]), true);
});

test("a choice prompt counts as answered once one of its choices is picked", () => {
  const mixed = [typed(6), picked("no")];
  assert.equal(canReveal(mixed, ["6", ""]), false);
  assert.equal(canReveal(mixed, ["6", "maybe"]), false);
  assert.equal(canReveal(mixed, ["6", "yes"]), true);
});

test("isRight compares the typed number or the picked choice with the answer", () => {
  assert.equal(isRight(typed(7), "7"), true);
  assert.equal(isRight(typed(7), "7.0"), true);
  assert.equal(isRight(typed(7), "6"), false);
  assert.equal(isRight(picked("no"), "no"), true);
  assert.equal(isRight(picked("no"), "yes"), false);
});
