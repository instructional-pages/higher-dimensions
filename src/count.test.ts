import assert from "node:assert/strict";
import { test } from "node:test";
import { closedForm, pieces, tally as cells, written } from "./count.ts";
import { extrude, type Group } from "./extrude.ts";

const ALL = new Set<Group>(["old", "new", "link"]);
const tally = (n: number, counted: ReadonlySet<Group>, columns: number) => cells(n, counted, columns).map(written);

test("the recurrence gives the outline's table, 0D to 5D", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5].map(pieces),
    [
      [1],
      [2, 1],
      [4, 4, 1],
      [8, 12, 6, 1],
      [16, 32, 24, 8, 1],
      [32, 80, 80, 40, 10, 1],
    ],
  );
  assert.equal(pieces(10)[0], 1024);
  assert.equal(pieces(6)[1], 192);
});

test("the closed form C(n, k)·2^(n − k) agrees with the recurrence", () => {
  assert.equal(closedForm(4, 2), 24);
  for (let n = 0; n <= 10; n++) assert.deepEqual(pieces(n).map((_, k) => closedForm(n, k)), pieces(n));
});

test("each group's size in the picture is the term it adds to the count", () => {
  for (const n of [1, 2, 3, 4]) {
    const { corners, edges, faces } = extrude(n, 1);
    const last = pieces(n - 1);
    const size = (list: { group: Group }[], group: Group) => list.filter((e) => e.group === group).length;
    assert.equal(corners.length / 2, last[0]);
    assert.deepEqual([size(edges, "old"), size(edges, "new"), size(edges, "link")], [last[1] ?? 0, last[1] ?? 0, last[0]]);
    assert.deepEqual([size(faces, "old"), size(faces, "new"), size(faces, "link")], [last[2] ?? 0, last[2] ?? 0, last[1] ?? 0]);
  }
});

test("a point is one corner and nothing else, whatever is counted", () => {
  assert.deepEqual(tally(0, new Set(), 2), ["1", "0"]);
  assert.deepEqual(tally(0, ALL, 4), ["1", "0", "0", "0"]);
});

test("a row is empty until a group is counted, then sums its groups in order", () => {
  assert.deepEqual(tally(3, new Set(), 2), ["", ""]);
  assert.deepEqual(tally(3, new Set(["old"]), 2), ["4", "4"]);
  assert.deepEqual(tally(3, new Set(["link"]), 2), ["", "4"]);
  assert.deepEqual(tally(3, ALL, 4), ["4 + 4 = 8", "4 + 4 + 4 = 12", "1 + 1 + 4 = 6", "0 + 0 + 1 = 1"]);
});

test("corners are complete once both copies are in; bigger pieces need the swept ones too", () => {
  assert.deepEqual(tally(4, new Set(["new", "old"]), 4), ["8 + 8 = 16", "12 + 12", "6 + 6", "1 + 1"]);
  assert.deepEqual(tally(1, ALL, 2), ["1 + 1 = 2", "0 + 0 + 1 = 1"]);
});

test("a lone term is a partial sum, not a total, until every group is in", () => {
  assert.deepEqual(cells(3, new Set(["old"]), 1), [{ sum: "4", total: "" }]);
  assert.deepEqual(cells(3, ALL, 2), [
    { sum: "4 + 4", total: "8" },
    { sum: "4 + 4 + 4", total: "12" },
  ]);
  assert.deepEqual(cells(0, ALL, 1), [{ sum: "", total: "1" }]);
});

test("pieces bigger than the shape are known to be 0 before anything is counted", () => {
  assert.deepEqual(tally(1, new Set(), 4), ["", "", "0", "0"]);
  assert.deepEqual(tally(2, ALL, 4), ["2 + 2 = 4", "1 + 1 + 2 = 4", "0 + 0 + 1 = 1", "0"]);
});
