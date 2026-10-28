// Tesseract sandbox: six plane sliders turn the tesseract, a seventh moves the cut
// w = h, an eighth folds the net. The shadow, the slice and the net sit side by side,
// and the 4×4 matrix shows the combined rotation. Redraws only when a slider moves or
// the window resizes.

import { AXES, PLANES, apply, rotation, tesseract, type Angles } from "./math4d.ts";
import { net } from "./net.ts";
import { createNetView, createProjection, createSliceView } from "./render.ts";
import { slice } from "./slice.ts";

const projectionCanvas = document.getElementById("projection") as HTMLCanvasElement;
const sliceCanvas = document.getElementById("slice") as HTMLCanvasElement;
const netCanvas = document.getElementById("net") as HTMLCanvasElement;
const sliders = document.getElementById("sliders")!;
const cutSlider = document.getElementById("cut")!;
const foldSlider = document.getElementById("fold")!;
const matrix = document.getElementById("matrix")!;

const shape = tesseract();
const projection = createProjection(projectionCanvas, shape);
const sliceView = createSliceView(sliceCanvas);
const netView = createNetView(netCanvas);
if (!projection || !sliceView || !netView) {
  document.getElementById("status")!.textContent = "This browser has no WebGL2, which the lessons need.";
} else {
  const angles = Object.fromEntries(PLANES.map((p) => [p, 0])) as Angles;
  let h = 0;
  let fold = 0;

  // A labelled slider row; `set` receives the new value, `show` writes it out.
  const addSlider = (
    parent: HTMLElement,
    name: string,
    min: number,
    max: number,
    set: (x: number) => void,
    // +0 turns −0.00 into 0.00.
    show = (x: number) => (x + 0).toFixed(2),
  ) => {
    const row = document.createElement("label");
    const input = document.createElement("input");
    const value = document.createElement("output");
    Object.assign(input, { type: "range", min: min.toFixed(2), max: max.toFixed(2), step: "0.01", value: "0" });
    value.textContent = show(0);
    row.append(name, input, value);
    parent.append(row);
    input.addEventListener("input", () => {
      const x = Number(input.value);
      set(x);
      value.textContent = show(x);
      schedule();
    });
  };
  for (const plane of PLANES) addSlider(sliders, plane, 0, 2 * Math.PI, (x) => (angles[plane] = x));
  // Rotated corners reach |w| = 2, so the cut sweeps the whole shape.
  addSlider(cutSlider, "h", -2, 2, (x) => (h = x));
  addSlider(foldSlider, "fold", 0, 1, (x) => (fold = x), (x) => `${Math.round(x * 100)}%`);

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
      netView.draw(net(fold), rotation({ ...angles, xw: 0, yw: 0, zw: 0 }));
    });
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(projectionCanvas);
  resize.observe(sliceCanvas);
  resize.observe(netCanvas);
}
