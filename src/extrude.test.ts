import assert from "node:assert/strict";
import { test } from "node:test";
import { dashes, extrude } from "./extrude.ts";

test("rung 0 is a lone point", () => {
  assert.deepEqual(extrude(0, 0.5), { corners: [[0, 0, 0, 0]], edges: [] });
});

test("rung 1 drags the point out along x into a segment", () => {
  assert.deepEqual(extrude(1, 0.25), {
    corners: [
      [0, 0, 0, 0],
      [0.25, 0, 0, 0],
    ],
    edges: [{ a: 0, b: 1, group: "link" }],
  });
});

test("rung 2 drags the segment along y: old, new and connecting edges", () => {
  const { corners, edges } = extrude(2, 1);
  assert.deepEqual(corners, [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 0, 0],
  ]);
  assert.deepEqual(edges, [
    { a: 0, b: 1, group: "old" },
    { a: 2, b: 3, group: "new" },
    { a: 0, b: 2, group: "link" },
    { a: 1, b: 3, group: "link" },
  ]);
});

test("fully extruded, rung n is the n-cube: 2^n corners of 0s and 1s, each edge one step", () => {
  for (const [rung, corners, edges] of [
    [1, 2, 1],
    [2, 4, 4],
    [3, 8, 12],
    [4, 16, 32],
  ] as const) {
    const shape = extrude(rung, 1);
    assert.equal(shape.corners.length, corners);
    assert.equal(shape.edges.length, edges);
    assert.equal(new Set(shape.corners.map((c) => c.join())).size, corners);
    for (const c of shape.corners) assert.ok(c.every((x, k) => (k < rung ? x === 0 || x === 1 : x === 0)));
    for (const { a, b } of shape.edges) {
      const differing = shape.corners[a]!.filter((x, k) => x !== shape.corners[b]![k]);
      assert.equal(differing.length, 1);
    }
  }
});

test("at 4D the new copy is the cube moved t along w, joined corner to corner", () => {
  const { corners, edges } = extrude(4, 0.5);
  for (let i = 0; i < 8; i++) {
    assert.equal(corners[i]![3], 0);
    assert.deepEqual(corners[i + 8], [...corners[i]!.slice(0, 3), 0.5]);
  }
  assert.deepEqual(
    edges.filter((e) => e.group === "link").map(({ a, b }) => [a, b]),
    [...Array(8).keys()].map((i) => [i, i + 8]),
  );
  assert.equal(edges.filter((e) => e.group === "old").length, 12);
  assert.equal(edges.filter((e) => e.group === "new").length, 12);
});

test("dashes split a segment, the last cut short at its end", () => {
  assert.deepEqual(dashes([0, 0, 0, 0], [0, 0, 0, 0.5], 0.1), [
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0.1],
    ],
    [
      [0, 0, 0, 0.2],
      [0, 0, 0, 0.30000000000000004],
    ],
    [
      [0, 0, 0, 0.4],
      [0, 0, 0, 0.5],
    ],
  ]);
  assert.deepEqual(dashes([1, 0, 0, 0], [1, 0, 0, 0], 0.1), []);
});
