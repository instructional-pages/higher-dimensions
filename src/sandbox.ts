// Tesseract sandbox: six plane sliders turn the tesseract, a seventh moves the cut
// w = h, an eighth folds the net. One of the shadow, the slice and the net is the main
// view, the other two sit small beside it; clicking a small one swaps it in. The 4×4
// matrix shows the combined rotation, and four corners show where it sends them.
// Redraws only when a slider moves or the window resizes.

import { AXES, PLANES, apply, rotation, tesseract, type Angles, type Vec4 } from "./math4d.ts";
import { net } from "./net.ts";
import { createNetView, createProjection, createSliceView } from "./render.ts";
import { slice } from "./slice.ts";
import { addSlider, figure, fixed, linkViews, span } from "./ui.ts";

// A and B differ in x, A and C in w, and D is opposite A.
const CORNERS: [string, Vec4][] = [
  ["A", [1, 1, 1, 1]],
  ["B", [-1, 1, 1, 1]],
  ["C", [1, 1, 1, -1]],
  ["D", [-1, -1, -1, -1]],
];

const ASIDE = `
  <a class="up" href="#">Contents</a>
  <h1>The tesseract</h1>
  <p class="status">Each slider turns it in one plane, in radians. The last three turn it into w.</p>
  <div class="sliders turn"></div>
  <p class="note">The slice keeps only the points where w&nbsp;=&nbsp;h.</p>
  <div class="sliders cut"></div>
  <p class="note">
    The net is the boundary cut open into 8 cubes. Folding hinges them back into the
    tesseract. It turns only in xy, xz and yz.
  </p>
  <div class="sliders fold"></div>
  <div class="grid matrix"></div>
  <p class="note">
    M = R<sub>zw</sub> R<sub>yw</sub> R<sub>xw</sub> R<sub>yz</sub> R<sub>xz</sub> R<sub>xy</sub>:
    xy turns first, zw last.
  </p>
  <div class="grid corners"></div>
  <p class="note">
    Four corners, marked in the shadow: where each starts, and where M sends it. A and B
    differ in x, A and C in w, and D is opposite A.
  </p>`;

// Builds the sandbox into `root`; the returned function stops it.
export function mountSandbox(root: HTMLElement): () => void {
  const views = Object.assign(document.createElement("div"), { className: "views" });
  const [projectionFigure, sliceFigure, netFigure] = [
    { caption: "Shadow", label: "The tesseract's shadow in 3D, with the slice marked inside it" },
    { caption: "Slice at w = h", label: "The 3D slice of the tesseract where w = h" },
    { caption: "Net", label: "The tesseract's net: its 8 cubes unfolded into 3D, folding back into the tesseract" },
  ].map(figure) as [HTMLElement, HTMLElement, HTMLElement];
  const marks = projectionFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
  views.append(projectionFigure, sliceFigure, netFigure);
  const aside = Object.assign(document.createElement("aside"), { innerHTML: ASIDE });
  root.append(views, aside);
  linkViews(views);

  const canvas = (f: HTMLElement) => f.querySelector("canvas")!;
  const [projectionCanvas, sliceCanvas, netCanvas] = [canvas(projectionFigure), canvas(sliceFigure), canvas(netFigure)];
  const $ = (selector: string) => aside.querySelector<HTMLElement>(selector)!;
  const sliders = $(".turn");
  const cutSlider = $(".cut");
  const foldSlider = $(".fold");
  const matrix = $(".matrix");
  const cornerTable = $(".corners");

  const shape = tesseract();
  const projection = createProjection(projectionCanvas, shape);
  const sliceView = createSliceView(sliceCanvas);
  const netView = createNetView(netCanvas);
  if (!projection || !sliceView || !netView) {
    $(".status").textContent = "This browser has no WebGL2, which the lessons need.";
    return () => {};
  }

  const angles = Object.fromEntries(PLANES.map((p) => [p, 0])) as Angles;
  let h = 0;
  let fold = 0;

  for (const plane of PLANES) addSlider(sliders, plane, 0, 2 * Math.PI, 0, (x) => ((angles[plane] = x), schedule()));
  // Rotated corners reach |w| = 2, so the cut sweeps the whole shape.
  addSlider(cutSlider, "h", -2, 2, 0, (x) => ((h = x), schedule()));
  addSlider(foldSlider, "fold", 0, 1, 0, (x) => ((fold = x), schedule()), (x) => `${Math.round(x * 100)}%`);

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
  cornerTable.append(span(""), ...AXES.map((axis) => span(axis, "axis")));
  for (const [label, corner] of CORNERS) {
    cornerTable.append(span(label, "axis"), ...corner.map((x) => span(String(x), "start")), span("→", "axis"));
    for (let c = 0; c < 4; c++) turnedCells.push(cornerTable.appendChild(span("")));
  }
  const markSpans = CORNERS.map(([label]) => marks.appendChild(span(label)));

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const m = rotation(angles);
      m.forEach((x, i) => (cells[i]!.textContent = fixed(x)));
      CORNERS.forEach(([, corner], k) => {
        const turned = apply(m, corner);
        turned.forEach((x, c) => (turnedCells[k * 4 + c]!.textContent = fixed(x)));
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
  return () => resize.disconnect();
}
