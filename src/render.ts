// Plain WebGL2 drawing of a projected 4D shape: thin edges and very faint faces,
// tinted cool to warm by each point's w. The 4D math runs on the CPU (a tesseract
// is 16 corners); the GPU only places the 3D shadow on screen through a fixed camera.

import { apply, multiply, planeRotation, projectW, type Mat4, type Shape, type Vec4 } from "./math4d.ts";

// Viewer distance along w, for the perspective projection 4D → 3D. Rotated corners
// reach |w| = 2, so this must stay above 2.
export const W_DISTANCE = 3;

const VERTEX = `#version 300 es
layout(location = 0) in vec4 a_point; // projected x, y, z, plus the rotated w for the tint
uniform mat4 u_camera;
out float v_w;
void main() {
  gl_Position = u_camera * vec4(a_point.xyz, 1.0);
  v_w = a_point.w;
}`;

const FRAGMENT = `#version 300 es
precision mediump float;
in float v_w;
uniform float u_alpha;
out vec4 color;
void main() {
  // w = -1 (far) is cool, w = +1 (near) is warm.
  vec3 cool = vec3(0.35, 0.62, 1.0);
  vec3 warm = vec3(1.0, 0.55, 0.25);
  color = vec4(mix(cool, warm, clamp(0.5 + 0.5 * v_w, 0.0, 1.0)), u_alpha);
}`;

const EDGE_ALPHA = 0.95;
const FACE_ALPHA = 0.03;

export interface Renderer {
  draw(rotation: Mat4): void;
}

export function createRenderer(canvas: HTMLCanvasElement, shape: Shape): Renderer | null {
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
  const alphaLoc = gl.getUniformLocation(program, "u_alpha");

  // Vertex order for gl.LINES (two per edge) and gl.TRIANGLES (two per square).
  const edgeOrder = shape.edges.flat();
  const faceOrder = shape.faces.flatMap(([a, b, c, d]) => [a, b, c, a, c, d]);
  const order = [...edgeOrder, ...faceOrder];
  const data = new Float32Array(order.length * 4);

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

  // Additive blending on black, no depth test: overlapping lines stay visible.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0, 0, 0, 1);

  return {
    draw(rotation) {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);

      const points = shape.vertices.map((v) => {
        const r = apply(rotation, v);
        return [...projectW(r, W_DISTANCE), r[3]] as Vec4;
      });
      order.forEach((i, k) => data.set(points[i]!, k * 4));
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);

      gl.uniformMatrix4fv(cameraLoc, true, camera(width / height));
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(alphaLoc, FACE_ALPHA);
      gl.drawArrays(gl.TRIANGLES, edgeOrder.length, faceOrder.length);
      gl.uniform1f(alphaLoc, EDGE_ALPHA);
      gl.drawArrays(gl.LINES, 0, edgeOrder.length);
    },
  };
}

// A fixed 3D camera, slightly above and to the side so the cube inside a cube reads
// as 3D. Row-major, uploaded with transpose.
function camera(aspect: number): Mat4 {
  const fov = 0.6;
  const near = 1;
  const far = 30;
  const f = 1 / Math.tan(fov / 2);
  // Keep the whole shadow in view on tall, narrow canvases too.
  const fx = Math.min(f / aspect, f);
  const fy = fx * aspect;
  const projection = [fx, 0, 0, 0, 0, fy, 0, 0, 0, 0, (near + far) / (near - far), (2 * near * far) / (near - far), 0, 0, -1, 0];
  const view = multiply(planeRotation("yz", 0.35), planeRotation("xz", -0.5));
  view[11] = -11;
  return multiply(projection, view);
}
