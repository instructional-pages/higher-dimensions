// The n-cube's net: its 2n pieces one dimension down (a square's 4 sides, a cube's 6
// squares, the tesseract's 8 cubes) unfolded, as small pure functions. Call the last
// axis (y for the square, z for the cube, w for the tesseract) "up". The base is the
// piece up = +1. The pieces on the other axes hinge on its sides, and the last piece,
// up = −1, hinges on the far side of the piece below the base along the column axis (x
// for the square, y above it). Laid flat, that is a column of four along the column axis
// (+1, the base, −1, up = −1) with one piece on each other side of the base: the square's
// 4 segments in a line, the cube's cross of squares, the tesseract's cross of cubes.
//
// Each hinge turns a piece about the side it shares with its parent, in the plane of one
// axis and up. At fold 1 every hinge is at 0° and the pieces are the n-cube; at fold 0
// they are at 90° and the whole net lies flat where up = 1.

import { AXES, apply, planeRotation, type Plane, type Shape, type Vec4 } from "./math4d.ts";
import { cube, inPiece } from "./shadow.ts";

// `turn` (±1) sets which way the hinge opens: the angle is turn · (1 − fold) · 90°.
interface Hinge {
  plane: Plane;
  turn: 1 | -1;
  pivot: Vec4;
}

// The hinges that unfold each of the n-cube's pieces, the piece's own hinge first, then
// its parent's. Piece c holds axis c >> 1 at −1 (c even) or +1 (c odd), as in `inPiece`.
function hinges(n: number): Hinge[][] {
  const up = n - 1;
  const column = n >= 3 ? 1 : 0;
  const pieces: Hinge[][] = [];
  for (let k = 0; k < up; k++)
    for (const sign of [-1, 1] as const) {
      // Folded, the piece runs from the shared side toward −up; unfolded, it runs on
      // outward along axis k.
      const pivot: Vec4 = [0, 0, 0, 0];
      pivot[k] = sign;
      pivot[up] = 1;
      pieces.push([{ plane: `${AXES[k]}${AXES[up]}` as Plane, turn: sign, pivot }]);
    }
  // The piece up = −1 runs from the side it shares with the column's −1 piece toward
  // +column. Turning that toward −up lines it up with that piece, which unfolds it on
  // down the column.
  const pivot: Vec4 = [0, 0, 0, 0];
  pivot[column] = -1;
  pivot[up] = -1;
  pieces.push([{ plane: `${AXES[column]}${AXES[up]}` as Plane, turn: -1, pivot }, ...pieces[2 * column]!]);
  pieces.push([]);
  return pieces;
}

const HINGES = [2, 3, 4].map(hinges);

// The n-cube's net (n from 2 to 4) at `fold` (0 flat, 1 folded): 2n separate pieces,
// each with its own corners, edges and squares, so pieces that touch in the net don't
// share points. `cells` lists each piece's corners.
export function net(fold: number, n = 4): Shape {
  const shape = cube(n);
  const angle = (1 - fold) * (Math.PI / 2);
  const vertices: Vec4[] = [];
  const edges: Shape["edges"] = [];
  const faces: Shape["faces"] = [];
  const cells: number[][] = [];
  HINGES[n - 2]!.forEach((chain, c) => {
    const piece = shape.vertices.flatMap((_, i) => (inPiece(c, i) ? [i] : []));
    const index = new Map(piece.map((v, k) => [v, vertices.length + k]));
    for (const v of piece) vertices.push(unfold(shape.vertices[v]!, chain, angle));
    for (const [a, b] of shape.edges) if (index.has(a) && index.has(b)) edges.push([index.get(a)!, index.get(b)!]);
    for (const f of shape.faces) if (f.every((v) => index.has(v))) faces.push(f.map((v) => index.get(v)!) as Shape["faces"][number]);
    cells.push([...index.values()]);
  });
  return { vertices, edges, faces, cells };
}

// The pieces in reading order, as the lesson numbers them: down the column (+1, the base,
// −1, up = −1), then the other sides, −1 before +1. The square's line reads left to
// right instead: up = −1, −1, the base, +1.
export function order(n: number): number[] {
  const up = n - 1;
  if (n === 2) return [2, 0, 3, 1];
  const sides = [...Array(up).keys()].filter((k) => k !== 1).flatMap((k) => [2 * k, 2 * k + 1]);
  return [3, 2 * up + 1, 2, 2 * up, ...sides];
}

// Applies the hinges in order: each turns the point about its pivot by turn · angle.
function unfold(p: Vec4, chain: Hinge[], angle: number): Vec4 {
  let q = p;
  for (const { plane, turn, pivot } of chain) {
    const d = apply(planeRotation(plane, turn * angle), q.map((x, i) => x - pivot[i]!) as Vec4);
    q = d.map((x, i) => x + pivot[i]!) as Vec4;
  }
  return q;
}
