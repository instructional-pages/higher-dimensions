// Lesson 2, "Building by extrusion": each cube is the one below it, dragged along a new
// direction. On each rung a slider pushes a copy of the shape out along the new axis;
// the old copy is dim, the new copy bright, and the edges joining them dashed, so the
// w tint still shows depth at 4D. Corners sit at their true 0/1 coordinates.

import { dashes, extrude, type Group } from "./extrude.ts";
import type { Lesson } from "./lesson.ts";
import { AXES, type Vec4 } from "./math4d.ts";
import { COOL, WARM, createLineView, css, tint } from "./render.ts";
import { addSlider, span } from "./ui.ts";

// Each step's rung, and where its extrusion starts: 0 so the learner drags it out, or 1
// for a finished shape.
const STEPS: { rung: number; t: number }[] = [
  { rung: 0, t: 0 },
  { rung: 1, t: 0 },
  { rung: 2, t: 0 },
  { rung: 3, t: 0 },
  { rung: 3, t: 1 },
  { rung: 4, t: 0 },
  { rung: 4, t: 1 },
];
const SANDBOX = STEPS.length - 1;
// The check stands on the finished cube, with no slider, before the tesseract exists.
const CHECK = 4;
const ALPHA: Record<Group, number> = { old: 0.35, new: 0.95, link: 0.7 };
const DASH = 0.04;
const AXIS_REACH = 1.25;
const AXIS_ALPHA = 0.2;

// 0 and 1 as they are, anything between to two places.
const short = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));
const coordinates = (c: Vec4, rung: number) => `(${c.slice(0, rung).map(short).join(", ")})`;

export const lesson2: Lesson = {
  title: "Building by extrusion",
  views: [{ caption: "Shadow", label: "A shape and the copy of it dragged along a new axis" }, { caption: "Corners" }],
  steps: [
    {
      text: `<p>Start with a point: 0D. It's a single corner, with no numbers.</p>`,
    },
    {
      text: `<p>Copy the point and drag the copy along x. The path between them is a segment:
        1D, with two corners, (0) and (1).</p><p>Drag it out.</p>`,
    },
    {
      text: `<p>Now copy the whole segment and drag the copy along y. Each corner draws an
        edge as it goes, and the segment sweeps out a square.</p><p>The old copy is dim, the
        new copy bright, and the edges joining them dashed.</p>`,
    },
    {
      text: `<p>Copy the square and drag it along z: a cube. Its corners are the old square's,
        ending in 0, and the copy's, ending in 1. Together they are every list of three 0s
        and 1s.</p>`,
    },
    {
      text: `<p>Next, the cube gets copied and dragged along w, the direction at right angles
        to x, y and z.</p><p>How many corners will the result, the tesseract, have?</p>`,
      check: {
        prompts: [{ label: "4D", answer: 16 }],
        after: "16: the cube's 8 corners, and 8 more on its copy. Each extrusion doubles the corners.",
      },
    },
    {
      text: `<p>Drag the cube along w. The copy is the same cube, moving only in w, so its
        shadow changes color, warming as w grows, and grows too: nearer in w looks bigger.
        </p><p>Its corners end in 1, the old cube's in 0: all 16 lists of four 0s and 1s.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> Pick a rung and drag the copy out.</p>
        <p>At every rung the new shape is two copies of the last one, plus an edge from each
        corner to its copy.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, cornersFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const labels = AXES.slice(0, 3).map((axis) => marks.appendChild(span(axis, "label")));
    const dots = marks.appendChild(document.createElement("div"));
    const table = cornersFigure.appendChild(Object.assign(document.createElement("div"), { className: "corners" }));
    const legend = cornersFigure.appendChild(Object.assign(document.createElement("div"), { className: "legend" }));
    legend.append(span("w −1"), Object.assign(span("", "scale"), { style: `background: linear-gradient(to right, ${css(COOL)}, ${css(WARM)})` }), span("+1"));

    let rung = 0;
    let t = 0;

    const place = (el: HTMLElement, v: Vec4) => {
      const [left, top] = view.screen(v);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { corners, edges } = extrude(rung, t);
        const axes = AXES.slice(0, Math.min(rung, 3)).map((_, k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH;
          return { from: end.map((x) => -x) as Vec4, to: end, alpha: AXIS_ALPHA };
        });
        const segments = edges.flatMap(({ a, b, group }) => {
          const alpha = ALPHA[group];
          const [from, to] = [corners[a]!, corners[b]!];
          const pieces: [Vec4, Vec4][] = group === "link" ? dashes(from, to, DASH) : [[from, to]];
          return pieces.map(([from, to]) => ({ from, to, alpha }));
        });
        view.draw([...axes, ...segments]);
        labels.forEach((label, k) => {
          label.hidden = k >= rung;
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH + 0.1;
          place(label, end);
        });

        // One mark per corner, old copy then new, and the same lists in the table.
        const half = corners.length / 2;
        dots.replaceChildren();
        table.replaceChildren();
        if (rung === 0) table.append(span("One corner, no numbers", "none"));
        else table.append(span("old copy", "head"), span("new copy", "head"));
        corners.forEach((c, i) => {
          const isNew = rung > 0 && i >= half;
          const dot = dots.appendChild(span(rung === 0 ? "" : coordinates(c, rung), isNew ? "corner new" : "corner"));
          dot.style.setProperty("--tint", css(tint(c[3])));
          place(dot, c);
          if (rung > 0) {
            const row = i < half ? i : i - half;
            const cell = table.appendChild(span(coordinates(c, rung)));
            cell.style.gridArea = `${row + 2} / ${isNew ? 2 : 1}`;
            if (rung === 4) cell.style.color = css(tint(c[3]));
          }
        });
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    const show = () => {
      legend.hidden = rung < 4;
      schedule();
    };

    return {
      show(step) {
        ({ rung, t } = STEPS[step]!);
        // The extrusion slider is named for the new axis: it sets the copy's coordinate there.
        let along: HTMLInputElement | undefined;
        if (step === SANDBOX)
          addSlider(
            controls,
            "rung",
            0,
            4,
            rung,
            (x) => {
              rung = x;
              along!.disabled = rung === 0;
              along!.parentElement!.firstChild!.textContent = AXES[rung - 1] ?? "–";
              show();
            },
            (x) => `${x}D`,
            1,
          );
        if (rung > 0 && step !== CHECK) along = addSlider(controls, AXES[rung - 1]!, 0, 1, t, (x) => ((t = x), schedule()));
        show();
      },
      stop: () => resize.disconnect(),
    };
  },
};
