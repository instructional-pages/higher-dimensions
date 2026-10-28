// Tesseract sandbox: six plane sliders turn the tesseract, a seventh moves the cut
// w = h, an eighth folds the net. One of the shadow, the slice and the net is the main
// view, the other two sit small beside it; clicking a small one swaps it in. The 4×4
// matrix shows the combined rotation, and four corners show where it sends them.
// Redraws only when a slider moves or the window resizes.

import { AXES, PLANES, apply, rotation, tesseract, type Angles, type Vec4 } from "./math4d.ts";
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
const cornerTable = document.getElementById("corners")!;
const marks = document.getElementById("marks")!;

// A and B differ in x, A and C in w, and D is opposite A.
const CORNERS: [string, Vec4][] = [
  ["A", [1, 1, 1, 1]],
  ["B", [-1, 1, 1, 1]],
  ["C", [1, 1, 1, -1]],
  ["D", [-1, -1, -1, -1]],
];

// The main view spans the left; the others are buttons that swap themselves in. Only
// classes change, so each canvas keeps its WebGL context.
const figures = [...document.querySelectorAll<HTMLElement>("#views figure")];
const makeMain = (main: HTMLElement) => {
  for (const figure of figures) {
    const small = figure !== main;
    figure.classList.toggle("main", !small);
    if (small) {
      figure.tabIndex = 0;
      figure.role = "button";
      figure.ariaLabel = `Make ${figure.querySelector("figcaption")!.textContent} the main view`;
    } else {
      figure.removeAttribute("tabindex");
      figure.removeAttribute("role");
      figure.removeAttribute("aria-label");
    }
  }
};
for (const figure of figures) {
  figure.addEventListener("click", () => makeMain(figure));
  figure.addEventListener("keydown", (e) => {
    if (figure.classList.contains("main") || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    makeMain(figure);
  });
}
makeMain(figures[0]!);

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

  // Same columns as the matrix: each corner's start in muted ±1, then where M sends it.
  const turnedCells: HTMLElement[] = [];
  const span = (text: string, className = "") => Object.assign(document.createElement("span"), { textContent: text, className });
  cornerTable.append(span(""), ...AXES.map((axis) => span(axis, "axis")));
  for (const [label, corner] of CORNERS) {
    cornerTable.append(span(label, "axis"), ...corner.map((x) => span(String(x), "start")), span("→", "axis"));
    for (let c = 0; c < 4; c++) turnedCells.push(cornerTable.appendChild(span("")));
  }
  const markSpans = CORNERS.map(([label]) => marks.appendChild(span(label)));

  // +0 turns −0.00 into 0.00.
  const show = (x: number) => (Math.round(x * 100) / 100 + 0).toFixed(2);

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const m = rotation(angles);
      m.forEach((x, i) => (cells[i]!.textContent = show(x)));
      CORNERS.forEach(([, corner], k) => {
        const turned = apply(m, corner);
        turned.forEach((x, c) => (turnedCells[k * 4 + c]!.textContent = show(x)));
        const [left, top] = projection.screen(turned);
        markSpans[k]!.style.left = `${left}px`;
        markSpans[k]!.style.top = `${top}px`;
      });
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
