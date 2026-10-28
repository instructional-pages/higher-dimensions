import assert from "node:assert/strict";
import { test } from "node:test";
import { counts, tally } from "./count.ts";
import { extrude } from "./extrude.ts";

test("the recurrence gives the outline's table, 0D to 4D", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map(counts),
    [
      { corners: 1, edges: 0 },
      { corners: 2, edges: 1 },
      { corners: 4, edges: 4 },
      { corners: 8, edges: 12 },
      { corners: 16, edges: 32 },
    ],
  );
  assert.equal(counts(10).corners, 1024);
});

test("each group's size in the picture is the term it adds to the count", () => {
  for (const n of [1, 2, 3, 4]) {
    const { corners, edges } = extrude(n, 1);
    const last = counts(n - 1);
    const size = (group: string) => edges.filter((e) => e.group === group).length;
    assert.equal(corners.length / 2, last.corners);
    assert.deepEqual([size("old"), size("new"), size("link")], [last.edges, last.edges, last.corners]);
  }
});

test("a point is one corner and no edges, whatever is counted", () => {
  assert.deepEqual(tally(0, new Set()), { corners: "1", edges: "0" });
});

test("a row is empty until a group is counted, then sums its groups in order", () => {
  assert.deepEqual(tally(3, new Set()), { corners: "", edges: "" });
  assert.deepEqual(tally(3, new Set(["old"])), { corners: "4", edges: "4" });
  assert.deepEqual(tally(3, new Set(["link"])), { corners: "", edges: "4" });
  assert.deepEqual(tally(3, new Set(["link", "new", "old"])), { corners: "4 + 4 = 8", edges: "4 + 4 + 4 = 12" });
});

test("corners are complete once both copies are in; edges need the connecting ones too", () => {
  assert.deepEqual(tally(4, new Set(["new", "old"])), { corners: "8 + 8 = 16", edges: "12 + 12" });
  assert.deepEqual(tally(1, new Set(["old", "new", "link"])), { corners: "1 + 1 = 2", edges: "0 + 0 + 1 = 1" });
});
