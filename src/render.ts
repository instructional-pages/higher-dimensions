// Plain WebGL2 drawing of the 4D views, tinted cool to warm by each point's w. The 4D
// math runs on the CPU (a tesseract is 16 corners); the GPU only places 3D points on
// screen through a fixed camera.
//
// - Projection: the shape's shadow along w, thin edges and very faint faces, with the
//   current slice marked inside it.
// - Slice: the cut at w = h, filled and shaded, with thin edges.
// - Net: the 8 cubes of the tesseract's boundary, unfolded into 3D, drawn like the
//   shadow and seen from further back.
// - Lines: any 4D segments' shadows, for the lessons' axes and paths.

import { apply, multiply, planeRotation, projectW, type Mat4, type Shape, type Vec3, type Vec4 } from "./math4d.ts";
import { cross, dot, type Slice } from "./slice.ts";

// Viewer distance along w, for the perspective projection 4D → 3D. Rotated corners
// reach |w| = 2, so this must stay above 2.
export const W_DISTANCE = 3;

// The w tint, as RGB from 0 to 1: w = -1 (far) is cool, w = +1 (near) is warm.
export const COOL: Vec3 = [0.35, 0.62, 1];
export const WARM: Vec3 = [1, 0.55, 0.25];

// The tint at `w`, the shader's formula on the CPU, for HTML drawn over the views.
export const tint = (w: number): Vec3 => {
  const t = Math.min(Math.max(0.5 + 0.5 * w, 0), 1);
  return COOL.map((c, k) => c + (WARM[k]! - c) * t) as Vec3;
};

// A CSS color for `rgb`.
export const css = (rgb: Vec3): string => `rgb(${rgb.map((c) => Math.round(c * 255)).join(" ")})`;

const VERTEX = `#version 300 es
layout(location = 0) in vec4 a_point; // x, y, z, plus the 4D w for the tint
layout(location = 1) in float a_alpha;
uniform mat4 u_camera;
out float v_w;
out float v_alpha;
void main() {
  gl_Position = u_camera * vec4(a_point.xyz, 1.0);
  v_w = a_point.w;
  v_alpha = a_alpha;
}`;

const FRAGMENT = `#version 300 es
precision mediump float;
in float v_w;
in float v_alpha;
out vec4 color;
void main() {
  vec3 cool = vec3(${COOL.join(", ")});
  vec3 warm = vec3(${WARM.join(", ")});
  color = vec4(mix(cool, warm, clamp(0.5 + 0.5 * v_w, 0.0, 1.0)), v_alpha);
}`;

const EDGE_ALPHA = 0.95;
const FACE_ALPHA = 0.03;
// The slice marked inside the projection: brighter than the shape's faces, but quiet.
const MARK_ALPHA = 0.14;
// Filled slice faces: brightness by how squarely they face the camera.
const FILL_MIN = 0.12;
const FILL_RANGE = 0.4;

// Five floats per vertex: x, y, z, w, alpha.
const STRIDE = 5;

interface View {
  // Draws triangles then lines, each a flat list of STRIDE floats per vertex. With
  // `solid`, nearer surfaces hide what's behind them; otherwise everything adds up.
  draw(triangles: number[], lines: number[], solid: boolean): void;
  // Where a 3D point lands on the canvas, in CSS pixels from its top left.
  screen(p: Vec3): [number, number];
}

// `distance` is how far the camera stands from the centre of the view.
function createView(canvas: HTMLCanvasElement, distance: number): View | null {
  const gl = canvas.getContext("webgl2");
  if (!gl) return null;

  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
  gl.useProgram(program);
  const cameraLoc = gl.getUniformLocation(program, "u_camera");

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, STRIDE * 4, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, STRIDE * 4, 16);

  // Additive blending on black: overlapping lines stay visible. Solid drawing adds the
  // depth test, with faces pushed back a little so their own edges show on top.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.depthFunc(gl.LEQUAL);
  gl.polygonOffset(1, 1);
  gl.clearColor(0, 0, 0, 1);

  return {
    draw(triangles, lines, solid) {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniformMatrix4fv(cameraLoc, true, camera(width / height, distance));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...triangles, ...lines]), gl.STREAM_DRAW);
      if (solid) gl.enable(gl.DEPTH_TEST), gl.enable(gl.POLYGON_OFFSET_FILL);
      else gl.disable(gl.DEPTH_TEST), gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.drawArrays(gl.TRIANGLES, 0, triangles.length / STRIDE);
      gl.drawArrays(gl.LINES, triangles.length / STRIDE, lines.length / STRIDE);
    },
    screen(p) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      return toScreen(camera(width / height, distance), p, width, height);
    },
  };
}

// Where `camera` puts the 3D point `p` on a width × height canvas, from its top left.
export function toScreen(camera: Mat4, p: Vec3, width: number, height: number): [number, number] {
  const [x, y, , w] = apply(camera, [...p, 1]);
  return [((1 + x / w) / 2) * width, ((1 - y / w) / 2) * height];
}

export interface ProjectionView {
  // `rotated` are the shape's corners after rotation; `cut` is the current slice at w = h.
  draw(rotated: Vec4[], cut: Slice, h: number): void;
  // Where a turned 4D point's shadow lands on the canvas, in CSS pixels.
  screen(v: Vec4): [number, number];
}

export function createProjection(canvas: HTMLCanvasElement, shape: Shape): ProjectionView | null {
  const view = createView(canvas, SHAPE_DISTANCE);
  if (!view) return null;
  return {
    draw(rotated, cut, h) {
      const { triangles, lines } = wireframe(shape, rotated.map(shadow));
      // The slice's points are in the hyperplane w = h, so they cast their own shadow.
      const lifted = cut.points.map((p) => shadow([...p, h]));
      for (const face of cut.faces)
        for (let k = 1; k + 1 < face.length; k++)
          for (const i of [face[0]!, face[k]!, face[k + 1]!]) triangles.push(...lifted[i]!, MARK_ALPHA);
      view.draw(triangles, lines, false);
    },
    screen: (v) => view.screen(projectW(v, W_DISTANCE)),
  };
}

export interface NetView {
  // `net` is the unfolded tesseract; `turn` turns it in 3D only (xy, xz, yz), which
  // keeps every point's w.
  draw(net: Shape, turn: Mat4): void;
}

// The flat net spans y from −5 to 3 at w = 1, which the shadow scales by 3/2, so its
// centre is at y = −1.5. Shifting it up turns the net about its own centre.
const NET_SHIFT = 1.5;
// The flat net reaches about 6.4 from its centre, twice the shadow's reach.
const NET_DISTANCE = 22;

export function createNetView(canvas: HTMLCanvasElement): NetView | null {
  const view = createView(canvas, NET_DISTANCE);
  if (!view) return null;
  return {
    draw(net, turn) {
      const placed = net.vertices.map((v) => {
        const [x, y, z] = shadow(v);
        const [tx, ty, tz] = apply(turn, [x, y + NET_SHIFT, z, 0]);
        return [tx, ty, tz, v[3]] as Vec4;
      });
      const { triangles, lines } = wireframe(net, placed);
      view.draw(triangles, lines, false);
    },
  };
}

export interface LineView {
  // Each segment's shadow, and each flat polygon's (corners in order around it), at its
  // own brightness from 0 to 1.
  draw(segments: { from: Vec4; to: Vec4; alpha: number }[], faces?: { corners: Vec4[]; alpha: number }[]): void;
  // Where a 4D point's shadow lands on the canvas, in CSS pixels.
  screen(v: Vec4): [number, number];
}

export function createLineView(canvas: HTMLCanvasElement): LineView | null {
  const view = createView(canvas, SHAPE_DISTANCE);
  if (!view) return null;
  return {
    draw(segments, faces = []) {
      const lines = segments.flatMap(({ from, to, alpha }) => [...shadow(from), alpha, ...shadow(to), alpha]);
      const triangles = faces.flatMap(({ corners, alpha }) =>
        corners.slice(1, -1).flatMap((_, k) => [corners[0]!, corners[k + 1]!, corners[k + 2]!].flatMap((c) => [...shadow(c), alpha])),
      );
      view.draw(triangles, lines, false);
    },
    screen: (v) => view.screen(projectW(v, W_DISTANCE)),
  };
}

// A point's shadow along w, keeping its w for the tint.
const shadow = (v: Vec4): Vec4 => [...projectW(v, W_DISTANCE), v[3]];

// Very faint faces and thin edges for `shape`, its corners already placed in 3D (plus
// w for the tint).
function wireframe(shape: Shape, placed: Vec4[]) {
  const triangles = shape.faces.flatMap(([a, b, c, d]) => [a, b, c, a, c, d].flatMap((i) => [...placed[i]!, FACE_ALPHA]));
  const lines = shape.edges.flatMap(([a, b]) => [...placed[a]!, EDGE_ALPHA, ...placed[b]!, EDGE_ALPHA]);
  return { triangles, lines };
}

export interface SliceView {
  // `h` tints the slice, as the w it lies at.
  draw(cut: Slice, h: number): void;
  // Where a slice point lands on the canvas, in CSS pixels.
  screen(p: Vec3): [number, number];
}

export function createSliceView(canvas: HTMLCanvasElement): SliceView | null {
  const view = createView(canvas, SHAPE_DISTANCE);
  if (!view) return null;
  const toCamera = cameraDirection();
  return {
    draw(cut, h) {
      const triangles: number[] = [];
      for (const face of cut.faces) {
        const [p, q, r] = face.map((i) => cut.points[i]!) as [Vec3, Vec3, Vec3];
        const n = cross(sub(q, p), sub(r, p));
        const alpha = FILL_MIN + FILL_RANGE * Math.abs(dot(n, toCamera) / Math.hypot(...n));
        for (let k = 1; k + 1 < face.length; k++)
          for (const i of [face[0]!, face[k]!, face[k + 1]!]) triangles.push(...cut.points[i]!, h, alpha);
      }
      const lines = cut.edges.flatMap(([a, b]) => [...cut.points[a]!, h, EDGE_ALPHA, ...cut.points[b]!, h, EDGE_ALPHA]);
      view.draw(triangles, lines, true);
    },
    screen: (p) => view.screen(p),
  };
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// The fixed 3D camera's turn, slightly above and to the side so shapes read as 3D.
const CAMERA_TURN = multiply(planeRotation("yz", 0.35), planeRotation("xz", -0.5));

// The direction from the shape toward the camera, in world coordinates: the turn's
// third row, since the camera looks down its own −z.
function cameraDirection(): Vec3 {
  return [CAMERA_TURN[8]!, CAMERA_TURN[9]!, CAMERA_TURN[10]!];
}

// The shadow and slice views' camera distance: rotated shadows reach about 3.4.
const SHAPE_DISTANCE = 11;

// Row-major, uploaded with transpose.
export function camera(aspect: number, distance: number): Mat4 {
  const fov = 0.6;
  const near = 1;
  const far = 3 * distance;
  const f = 1 / Math.tan(fov / 2);
  // Keep the whole shape in view on tall, narrow canvases too.
  const fx = Math.min(f / aspect, f);
  const fy = fx * aspect;
  const projection = [fx, 0, 0, 0, 0, fy, 0, 0, 0, 0, (near + far) / (near - far), (2 * near * far) / (near - far), 0, 0, -1, 0];
  const view = [...CAMERA_TURN];
  view[11] = -distance;
  return multiply(projection, view);
}
