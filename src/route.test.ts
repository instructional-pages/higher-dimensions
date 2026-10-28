import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRoute } from "./route.ts";

test("a number names a built lesson", () => {
  assert.deepEqual(parseRoute("#1", 1), { page: "lesson", n: 1 });
  assert.deepEqual(parseRoute("#12", 12), { page: "lesson", n: 12 });
});

test("the sandbox has its own name", () => {
  assert.deepEqual(parseRoute("#sandbox", 1), { page: "sandbox" });
});

test("anything else is the contents", () => {
  for (const hash of ["", "#", "#2", "#0", "#01", "#-1", "#1.5", "#abc"])
    assert.deepEqual(parseRoute(hash, 1), { page: "contents" }, hash);
});
