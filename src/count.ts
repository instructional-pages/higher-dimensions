// Lesson 3's count: extrusion says how to count the n-cube. Its corners are the old
// copy's plus the new copy's, V(n) = 2·V(n − 1); its edges are both copies' plus one
// connecting edge per old corner, E(n) = 2·E(n − 1) + V(n − 1).

import type { Group } from "./extrude.ts";

export const GROUPS: readonly Group[] = ["old", "new", "link"];

export function counts(n: number): { corners: number; edges: number } {
  if (n === 0) return { corners: 1, edges: 0 };
  const last = counts(n - 1);
  return { corners: 2 * last.corners, edges: 2 * last.edges + last.corners };
}

// Row n of the table with the `counted` groups added in, as sums in the order old, new,
// connecting; each gets its total once every group it needs is in. "" before any is.
export function tally(n: number, counted: ReadonlySet<Group>): { corners: string; edges: string } {
  if (n === 0) return { corners: "1", edges: "0" };
  const last = counts(n - 1);
  const terms = (sizes: Partial<Record<Group, number>>) => {
    const groups = GROUPS.filter((g) => g in sizes);
    const sum = groups.filter((g) => counted.has(g)).map((g) => sizes[g]!);
    const done = sum.length === groups.length;
    return sum.join(" + ") + (done ? ` = ${sum.reduce((a, b) => a + b)}` : "");
  };
  return {
    corners: terms({ old: last.corners, new: last.corners }),
    edges: terms({ old: last.edges, new: last.edges, link: last.corners }),
  };
}
