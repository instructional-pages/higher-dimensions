// Tesseract sandbox: six plane sliders turn the tesseract, the 4×4 matrix beside it
// shows the combined rotation. Redraws only when a slider moves or the window resizes.

import { AXES, PLANES, rotation, tesseract, type Angles } from "./math4d.ts";
import { createRenderer } from "./render.ts";

const canvas = document.getElementById("view") as HTMLCanvasElement;
const sliders = document.getElementById("sliders")!;
const matrix = document.getElementById("matrix")!;

const renderer = createRenderer(canvas, tesseract());
if (!renderer) {
  document.getElementById("status")!.textContent = "This browser has no WebGL2, which the lessons need.";
} else {
  const angles = Object.fromEntries(PLANES.map((p) => [p, 0])) as Angles;

  for (const plane of PLANES) {
    const row = document.createElement("label");
    const input = document.createElement("input");
    const value = document.createElement("output");
    Object.assign(input, { type: "range", min: "0", max: (2 * Math.PI).toFixed(2), step: "0.01", value: "0" });
    value.textContent = "0.00";
    row.append(plane, input, value);
    sliders.append(row);
    input.addEventListener("input", () => {
      angles[plane] = Number(input.value);
      value.textContent = angles[plane].toFixed(2);
      schedule();
    });
  }

  // Header row and column name the axes: column c is where a coordinate comes from,
  // row r is the coordinate it feeds.
  const cells: HTMLElement[] = [];
  matrix.append(document.createElement("span"));
  for (const axis of AXES) matrix.append(Object.assign(document.createElement("span"), { textContent: axis, className: "axis" }));
  for (const axis of AXES) {
    matrix.append(Object.assign(document.createElement("span"), { textContent: axis, className: "axis" }));
    for (let c = 0; c < 4; c++) cells.push(matrix.appendChild(document.createElement("span")));
  }

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const m = rotation(angles);
      // +0 turns −0.00 into 0.00.
      m.forEach((x, i) => (cells[i]!.textContent = (Math.round(x * 100) / 100 + 0).toFixed(2)));
      renderer.draw(m);
    });
  };
  new ResizeObserver(schedule).observe(canvas);
}
