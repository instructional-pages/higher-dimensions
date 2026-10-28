// Tesseract sandbox: six plane sliders turn the tesseract, a seventh moves the cut
// w = h. The shadow and the slice sit side by side, and the 4×4 matrix shows the
// combined rotation. Redraws only when a slider moves or the window resizes.

import { AXES, PLANES, apply, rotation, tesseract, type Angles } from "./math4d.ts";
import { createProjection, createSliceView } from "./render.ts";
import { slice } from "./slice.ts";

const projectionCanvas = document.getElementById("projection") as HTMLCanvasElement;
const sliceCanvas = document.getElementById("slice") as HTMLCanvasElement;
const sliders = document.getElementById("sliders")!;
const cutSlider = document.getElementById("cut")!;
const matrix = document.getElementById("matrix")!;

const shape = tesseract();
const projection = createProjection(projectionCanvas, shape);
const sliceView = createSliceView(sliceCanvas);
if (!projection || !sliceView) {
  document.getElementById("status")!.textContent = "This browser has no WebGL2, which the lessons need.";
} else {
  const angles = Object.fromEntries(PLANES.map((p) => [p, 0])) as Angles;
  let h = 0;

  // A labelled slider row; `set` receives the new value.
  const addSlider = (parent: HTMLElement, name: string, min: number, max: number, set: (x: number) => void) => {
    const row = document.createElement("label");
    const input = document.createElement("input");
    const value = document.createElement("output");
    Object.assign(input, { type: "range", min: min.toFixed(2), max: max.toFixed(2), step: "0.01", value: "0" });
    value.textContent = "0.00";
    row.append(name, input, value);
    parent.append(row);
    input.addEventListener("input", () => {
      const x = Number(input.value);
      set(x);
      value.textContent = (x + 0).toFixed(2);
      schedule();
    });
  };
  for (const plane of PLANES) addSlider(sliders, plane, 0, 2 * Math.PI, (x) => (angles[plane] = x));
  // Rotated corners reach |w| = 2, so the cut sweeps the whole shape.
  addSlider(cutSlider, "h", -2, 2, (x) => (h = x));

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
      const rotated = shape.vertices.map((v) => apply(m, v));
      const cut = slice(shape, rotated, h);
      projection.draw(rotated, cut, h);
      sliceView.draw(cut, h);
    });
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(projectionCanvas);
  resize.observe(sliceCanvas);
}
