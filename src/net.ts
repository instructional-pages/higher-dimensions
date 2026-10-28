// The tesseract's net: its 8 cubic cells unfolded into 3D, as small pure functions.
// The base is the cell w = +1. The cells x = ±1, y = ±1 and z = ±1 hinge on its six
// square faces, and the last cell, w = −1, hinges on the far face of y = −1. Laid flat,
// that is the cross of cubes: a column of four along y (y = +1, the base, y = −1,
// w = −1) with one cube on each side face of the base.
//
// Each hinge turns a cell about the square it shares with its parent, in the plane of
// one space axis and w. At fold 1 every hinge is at 0° and the cells are the tesseract;
// at fold 0 they are at 90° and the whole net lies in the hyperplane w = 1.

import { AXES, apply, planeRotation, tesseract, type Plane, type Shape, type Vec4 } from "./math4d.ts";

// `turn` (±1) sets which way the hinge opens: the angle is turn · (1 − fold) · 90°.
interface Hinge {
  plane: Plane;
  turn: 1 | -1;
  pivot: Vec4;
}

// The hinges that unfold each of the tesseract's cells, child's own hinge first, then
// its parent's. Cells are indexed as in tesseract(): axis k at 0 (−1) or 1 (+1) is
// cell 2k or 2k + 1.
function hinges(): Hinge[][] {
  const base: Hinge[] = [];
  const pieces: Hinge[][] = [];
  for (let k = 0; k < 3; k++)
    for (const sign of [-1, 1] as const) {
      // Folded, the cell runs from the shared square toward −w; unfolded, it runs on
      // outward along axis k.
      const pivot: Vec4 = [0, 0, 0, 1];
      pivot[k] = sign;
      pieces.push([{ plane: `${AXES[k]}w` as Plane, turn: sign, pivot }]);
    }
  const below = pieces[2]!; // y = −1
  // The cell w = −1 runs from the square it shares with y = −1 toward +y. Turning that
  // toward −w lines it up with y = −1, which unfolds it on down the column.
  pieces.push([{ plane: "yw", turn: -1, pivot: [0, -1, 0, -1] }, ...below]);
  pieces.push(base);
  return pieces;
}

const HINGES = hinges();

// The net at `fold` (0 flat, 1 folded): 8 separate cubes, each with its own 8 corners,
// 12 edges and 6 squares, so cubes that touch in the net don't share points.
export function net(fold: number): Shape {
  const cube = tesseract();
  const angle = (1 - fold) * (Math.PI / 2);
  const vertices: Vec4[] = [];
  const edges: Shape["edges"] = [];
  const faces: Shape["faces"] = [];
  const cells: number[][] = [];
  cube.cells.forEach((cell, c) => {
    const index = new Map(cell.map((v, k) => [v, vertices.length + k]));
    for (const v of cell) vertices.push(unfold(cube.vertices[v]!, HINGES[c]!, angle));
    for (const [a, b] of cube.edges) if (index.has(a) && index.has(b)) edges.push([index.get(a)!, index.get(b)!]);
    for (const f of cube.faces)
      if (f.every((v) => index.has(v))) faces.push(f.map((v) => index.get(v)!) as Shape["faces"][number]);
    cells.push([...index.values()]);
  });
  return { vertices, edges, faces, cells };
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
