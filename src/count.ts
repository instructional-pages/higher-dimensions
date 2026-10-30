// Lessons 3 and 4's count: extrusion says how to count the n-cube's pieces of every
// size. A k-piece (corner, edge, square, cube for k = 0 to 3) of the new shape is a
// k-piece of the old copy or of the new copy, or a (k − 1)-piece of the old copy swept
// along the new direction: F(n, k) = 2·F(n − 1, k) + F(n − 1, k − 1).

import type { Group } from "./extrude.ts";

export const GROUPS: readonly Group[] = ["old", "new", "link"];

// F(n, k) for k = 0 to n: the n-cube's corners, edges, squares, and so on.
export function pieces(n: number): number[] {
  if (n === 0) return [1];
  const last = pieces(n - 1);
  return [...last, 0].map((f, k) => 2 * f + (last[k - 1] ?? 0));
}

// The closed form: choose the k directions a piece spans, C(n, k) ways, then its side
// (0 or 1) in each of the other n − k, 2ⁿ⁻ᵏ ways.
export function closedForm(n: number, k: number): number {
  let choose = 1;
  for (let i = 0; i < k; i++) choose = (choose * (n - i)) / (i + 1);
  return choose * 2 ** (n - k);
}

// A cell of the table: the sum so far, and the total once the sum is complete. A count
// known without summing has only a total.
export interface Cell {
  sum: string;
  total: string;
}

// The cell as one line: "4 + 4 = 8", "4 + 4" while incomplete, or the bare total.
export const written = ({ sum, total }: Cell): string => (sum && total ? `${sum} = ${total}` : sum || total);

// Row n of the table, its first `columns` sizes, with the `counted` groups added in as
// sums in the order old, new, swept; each gets its total once every group it needs is in.
// Empty before any is. The point's row and pieces bigger than the shape are already known.
export function tally(n: number, counted: ReadonlySet<Group>, columns: number): Cell[] {
  const now = pieces(n);
  if (n === 0) return Array.from({ length: columns }, (_, k) => ({ sum: "", total: String(now[k] ?? 0) }));
  const last = pieces(n - 1);
  return Array.from({ length: columns }, (_, k) => {
    if (k > n) return { sum: "", total: "0" };
    // Corners have nothing smaller to sweep.
    const groups = k === 0 ? GROUPS.slice(0, 2) : GROUPS;
    const sizes: Record<Group, number> = { old: last[k] ?? 0, new: last[k] ?? 0, link: last[k - 1] ?? 0 };
    const sum = groups.filter((g) => counted.has(g)).map((g) => sizes[g]);
    return { sum: sum.join(" + "), total: sum.length === groups.length ? String(now[k]) : "" };
  });
}
