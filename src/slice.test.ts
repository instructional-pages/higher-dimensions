import assert from "node:assert/strict";
import { test } from "node:test";
import { apply, identity, rotation, tesseract, type Mat4, type Vec3 } from "./math4d.ts";
import { cross, dot, slice } from "./slice.ts";

const shape = tesseract();
const cut = (m: Mat4, h: number) => slice(shape, shape.vertices.map((v) => apply(m, v)), h);
const round = (x: number) => Math.round(x * 1e9) / 1e9 + 0;
const counts = (s: ReturnType<typeof slice>) => [s.points.length, s.edges.length, s.faces.length];
const sides = (s: ReturnType<typeof slice>) => s.faces.map((f) => f.length).sort();

// Corner-first: a reflection sending the long diagonal (1, 1, 1, 1) onto +w, so a
// corner's w is the sum of its coordinates over 2 and the levels are −2, −1, 0, 1, 2.
const cornerFirst: Mat4 = (() => {
  const u = [0.5, 0.5, 0.5, -0.5];
  const m = identity();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) m[r * 4 + c]! -= 2 * u[r]! * u[c]!;
  return m;
})();

test("straight on, the middle slice is the cube with 8 corners, 12 edges, 6 squares", () => {
  const s = cut(identity(), 0);
  assert.deepEqual(counts(s), [8, 12, 6]);
  assert.deepEqual(sides(s), [4, 4, 4, 4, 4, 4]);
  for (const p of s.points) assert.deepEqual(p.map(Math.abs), [1, 1, 1]);
});

test("straight on, cutting exactly through the end cell still gives the cube", () => {
  assert.deepEqual(counts(cut(identity(), 1)), [8, 12, 6]);
  assert.deepEqual(counts(cut(identity(), -1)), [8, 12, 6]);
});

test("past the shape there is no slice", () => {
  assert.deepEqual(counts(cut(identity(), 1.01)), [0, 0, 0]);
});

test("corner first: a tetrahedron near the corner", () => {
  const s = cut(cornerFirst, 1.5);
  assert.deepEqual(counts(s), [4, 6, 4]);
  assert.deepEqual(sides(s), [3, 3, 3, 3]);
});

test("corner first: corners on the cut at w = 1 make a tetrahedron through them", () => {
  assert.deepEqual(counts(cut(cornerFirst, 1)), [4, 6, 4]);
});

test("corner first: between levels, a truncated tetrahedron", () => {
  const s = cut(cornerFirst, 0.5);
  assert.deepEqual(counts(s), [12, 18, 8]);
  assert.deepEqual(sides(s), [3, 3, 3, 3, 6, 6, 6, 6]);
});

test("corner first: the middle slice is the octahedron, through six corners", () => {
  const s = cut(cornerFirst, 0);
  assert.deepEqual(counts(s), [6, 12, 8]);
  assert.deepEqual(sides(s), [3, 3, 3, 3, 3, 3, 3, 3]);
});

test("corner first: the very tip is a single point with no faces", () => {
  assert.deepEqual(counts(cut(cornerFirst, 2)), [1, 0, 0]);
});

test("turning in xw stretches the middle slice along x by 1 / cos θ", () => {
  // Lesson 10: the cube slice becomes a longer box along x.
  const theta = Math.PI / 6;
  const s = cut(rotation({ xy: 0, xz: 0, yz: 0, xw: theta, yw: 0, zw: 0 }), 0);
  assert.deepEqual(counts(s), [8, 12, 6]);
  const xs = [...new Set(s.points.map((p) => round(Math.abs(p[0]))))];
  assert.deepEqual(xs, [round(1 / Math.cos(theta))]);
});

test("turning only in xy, xz, yz never changes the slice's shape", () => {
  const s = cut(rotation({ xy: 0.4, xz: 1.3, yz: 2.2, xw: 0, yw: 0, zw: 0 }), 0.3);
  assert.deepEqual(counts(s), [8, 12, 6]);
});

test("any turn and cut gives a closed, convex polytope with flat, ordered faces", () => {
  const angles = { xy: 0.3, xz: 1.1, yz: -0.4, xw: 2.2, yw: 0.9, zw: 5 };
  for (const h of [-1.7, -0.9, -0.2, 0, 0.6, 1.3]) {
    const s = cut(rotation(angles), h);
    const [v, e, f] = counts(s);
    assert.equal(v! - e! + f!, 2, `Euler's formula at h = ${h}`);
    const centre = [0, 1, 2].map((k) => s.points.reduce((t, p) => t + p[k]!, 0) / v!) as Vec3;
    for (const face of s.faces) {
      const p = face.map((i) => s.points[i]!);
      const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const n = cross(sub(p[1]!, p[0]!), sub(p[2]!, p[0]!));
      // Every corner of the slice lies on the same side of each face as the centre,
      // and consecutive corners turn the same way: the face is convex and in order.
      const inward = Math.sign(dot(n, sub(centre, p[0]!)));
      for (const q of s.points) assert.ok(inward * dot(n, sub(q, p[0]!)) > -1e-9);
      for (let k = 0; k < p.length; k++) {
        const a = p[k]!, b = p[(k + 1) % p.length]!, c = p[(k + 2) % p.length]!;
        assert.ok(dot(cross(sub(b, a), sub(c, b)), n) > 0, `face order at h = ${h}`);
      }
    }
  }
});
