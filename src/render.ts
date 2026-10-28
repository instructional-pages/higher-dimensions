// Plain WebGL2 drawing of the 4D views, tinted cool to warm by each point's w. The 4D
// math runs on the CPU (a tesseract is 16 corners); the GPU only places 3D points on
// screen through a fixed camera.
//
// - Projection: the shape's shadow along w, thin edges and very faint faces, with the
//   current slice marked inside it.
// - Slice: the cut at w = h, filled and shaded, with thin edges.

import { multiply, planeRotation, projectW, type Mat4, type Shape, type Vec3, type Vec4 } from "./math4d.ts";
import { cross, dot, type Slice } from "./slice.ts";

// Viewer distance along w, for the perspective projection 4D → 3D. Rotated corners
// reach |w| = 2, so this must stay above 2.
export const W_DISTANCE = 3;

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
  // w = -1 (far) is cool, w = +1 (near) is warm.
  vec3 cool = vec3(0.35, 0.62, 1.0);
  vec3 warm = vec3(1.0, 0.55, 0.25);
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
}

function createView(canvas: HTMLCanvasElement): View | null {
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
      gl.uniformMatrix4fv(cameraLoc, true, camera(width / height));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...triangles, ...lines]), gl.STREAM_DRAW);
      if (solid) gl.enable(gl.DEPTH_TEST), gl.enable(gl.POLYGON_OFFSET_FILL);
      else gl.disable(gl.DEPTH_TEST), gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.drawArrays(gl.TRIANGLES, 0, triangles.length / STRIDE);
      gl.drawArrays(gl.LINES, triangles.length / STRIDE, lines.length / STRIDE);
    },
  };
}

export interface ProjectionView {
  // `rotated` are the shape's corners after rotation; `cut` is the current slice at w = h.
  draw(rotated: Vec4[], cut: Slice, h: number): void;
}

export function createProjection(canvas: HTMLCanvasElement, shape: Shape): ProjectionView | null {
  const view = createView(canvas);
  if (!view) return null;
  return {
    draw(rotated, cut, h) {
      const point = (v: Vec4, alpha: number) => [...projectW(v, W_DISTANCE), v[3], alpha];
      const triangles = shape.faces.flatMap(([a, b, c, d]) =>
        [a, b, c, a, c, d].flatMap((i) => point(rotated[i]!, FACE_ALPHA)),
      );
      // The slice's points are in the hyperplane w = h, so they cast their own shadow.
      const lifted = cut.points.map((p) => [...p, h] as Vec4);
      for (const face of cut.faces)
        for (let k = 1; k + 1 < face.length; k++)
          for (const i of [face[0]!, face[k]!, face[k + 1]!]) triangles.push(...point(lifted[i]!, MARK_ALPHA));
      const lines = shape.edges.flatMap(([a, b]) => [...point(rotated[a]!, EDGE_ALPHA), ...point(rotated[b]!, EDGE_ALPHA)]);
      view.draw(triangles, lines, false);
    },
  };
}

export interface SliceView {
  draw(cut: Slice, h: number): void;
}

export function createSliceView(canvas: HTMLCanvasElement): SliceView | null {
  const view = createView(canvas);
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

// Row-major, uploaded with transpose.
function camera(aspect: number): Mat4 {
  const fov = 0.6;
  const near = 1;
  const far = 30;
  const f = 1 / Math.tan(fov / 2);
  // Keep the whole shape in view on tall, narrow canvases too.
  const fx = Math.min(f / aspect, f);
  const fy = fx * aspect;
  const projection = [fx, 0, 0, 0, 0, fy, 0, 0, 0, 0, (near + far) / (near - far), (2 * near * far) / (near - far), 0, 0, -1, 0];
  const view = [...CAMERA_TURN];
  view[11] = -11;
  return multiply(projection, view);
}
