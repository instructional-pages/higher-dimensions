// 4D rotation and projection as small pure functions. Matrices are 4×4, row-major,
// in plain arrays of 16 numbers: entry (row r, column c) is at r * 4 + c.

export type Vec4 = [number, number, number, number];
export type Vec3 = [number, number, number];
export type Mat4 = number[];

export const AXES = ["x", "y", "z", "w"] as const;

// The six rotation planes, in the fixed order the sliders combine: xy is applied
// first, zw last. The w-fixed planes come first, as in the lessons.
export const PLANES = ["xy", "xz", "yz", "xw", "yw", "zw"] as const;
export type Plane = (typeof PLANES)[number];
export type Angles = Record<Plane, number>;

export function identity(): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

// Rotation by θ in one plane: the 2×2 block [cos −sin; sin cos] placed in that
// plane's rows and columns of the identity. It turns the first axis toward the second.
export function planeRotation(plane: Plane, theta: number): Mat4 {
  const a = AXES.indexOf(plane[0] as (typeof AXES)[number]);
  const b = AXES.indexOf(plane[1] as (typeof AXES)[number]);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const m = identity();
  m[a * 4 + a] = c;
  m[a * 4 + b] = -s;
  m[b * 4 + a] = s;
  m[b * 4 + b] = c;
  return m;
}

export function multiply(p: Mat4, q: Mat4): Mat4 {
  const m: Mat4 = new Array(16).fill(0);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      for (let k = 0; k < 4; k++) m[r * 4 + c]! += p[r * 4 + k]! * q[k * 4 + c]!;
  return m;
}

// The combined rotation: M = R_zw · R_yw · R_xw · R_yz · R_xz · R_xy, so a point
// is turned in xy first and zw last.
export function rotation(angles: Angles): Mat4 {
  let m = identity();
  for (const plane of PLANES) m = multiply(planeRotation(plane, angles[plane]), m);
  return m;
}

export function apply(m: Mat4, v: Vec4): Vec4 {
  const out: Vec4 = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++)
    out[r] = m[r * 4]! * v[0] + m[r * 4 + 1]! * v[1] + m[r * 4 + 2]! * v[2] + m[r * 4 + 3]! * v[3];
  return out;
}

// Perspective along w for a viewer at w = d: nearer (higher w) is bigger, scaled by
// d / (d − w). Points need w < d.
export function projectW(v: Vec4, d: number): Vec3 {
  const k = d / (d - v[3]);
  return [v[0] * k, v[1] * k, v[2] * k];
}

export interface Shape {
  vertices: Vec4[];
  edges: [number, number][];
  // Squares as four vertex indices in order around the square.
  faces: [number, number, number, number][];
}

// The tesseract with corners at ±1. Vertex i has bit k set when coordinate k is +1,
// so an edge joins corners that differ in one bit and a square spans two bits.
export function tesseract(): Shape {
  const vertices: Vec4[] = [];
  for (let i = 0; i < 16; i++)
    vertices.push([0, 1, 2, 3].map((k) => ((i >> k) & 1 ? 1 : -1)) as Vec4);
  const edges: [number, number][] = [];
  const faces: [number, number, number, number][] = [];
  for (let i = 0; i < 16; i++)
    for (let a = 0; a < 4; a++) {
      const ba = 1 << a;
      if (i & ba) continue;
      edges.push([i, i | ba]);
      for (let b = a + 1; b < 4; b++) {
        const bb = 1 << b;
        if (!(i & bb)) faces.push([i, i | ba, i | ba | bb, i | bb]);
      }
    }
  return { vertices, edges, faces };
}
