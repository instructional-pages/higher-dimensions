// Lesson 1, "Where is a point?": one point, and one more number for each new direction.
// Each rung adds an axis and its slider; the point's walk (along x, then y, z, w) shows
// each number as a step, and the coordinate column grows by one entry per rung.

import type { Lesson } from "./lesson.ts";
import { AXES, type Vec4 } from "./math4d.ts";
import { COOL, WARM, createLineView, css, tint } from "./render.ts";
import { addSlider, fixed, span } from "./ui.ts";
import { onRung, walk } from "./walk.ts";

// Which rung (how many axes) each step stands on.
const RUNGS = [0, 1, 2, 3, 4, 4, 4];
// Axes are drawn a little past the sliders' reach of ±1.
const AXIS_REACH = 1.25;
const AXIS_ALPHA = 0.3;
const WALK_ALPHA = 0.8;

export const lesson1: Lesson = {
  title: "Where is a point?",
  views: [{ caption: "Shadow", label: "A point and the axes it moves along" }, { caption: "Coordinates" }],
  steps: [
    {
      text: `<p>Start with no directions at all: 0D. There is only one place to be, so a point
        needs no numbers to say where it is.</p>`,
    },
    {
      text: `<p>Add one direction, x, and the point can be anywhere along a line: 1D. One number
        says where.</p><p>Drag x.</p>`,
    },
    {
      text: `<p>Add a second direction, y, at right angles to x: a plane, 2D. Now it takes two
        numbers, (x, y).</p><p>The line in the picture walks the point there: x along x,
        then y along y.</p>`,
    },
    {
      text: `<p>Add z, at right angles to both: 3D, the space you live in. Three numbers,
        (x, y, z).</p>`,
    },
    {
      text: `<p>Now add w, at right angles to x, y and z at once: 4D. There's no room left for it
        in our space, so we can't point along it, but we can still write a fourth number.</p>
        <p>Drag w. The point keeps its x, y and z, but its color changes: cool for low w,
        warm for high w. From here on, color is how every view shows w.</p>
        <p>Away from the centre it also moves out as w grows: what we see is a shadow, and
        nearer in w looks bigger, the way nearer things do.</p>`,
    },
    {
      text: `<p>A list of numbers like (x, y, z, w) is a <em>vector</em>. Each direction adds one
        entry.</p><p>How many numbers do you need to place a point in 4D? In 7D?</p>`,
      check: {
        prompts: [
          { label: "4D", answer: 4 },
          { label: "7D", answer: 7 },
        ],
        after: "One number per direction: a point in nD is a vector of n numbers.",
      },
    },
    {
      text: `<p><strong>Sandbox.</strong> Move the point anywhere in 4D.</p>
        <p>Try (1, 0, 0, 0), then (0, 0, 0, 1): both are one step from the centre, but the
        second one's shadow sits right on it. Its whole step is in w.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, coordinatesFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const dot = marks.appendChild(span("", "point"));
    const labels = AXES.slice(0, 3).map((axis) => marks.appendChild(span(axis, "label")));
    const column = coordinatesFigure.appendChild(Object.assign(document.createElement("div"), { className: "column" }));
    const legend = coordinatesFigure.appendChild(Object.assign(document.createElement("div"), { className: "legend" }));
    legend.append(span("w −1"), Object.assign(span("", "scale"), { style: `background: linear-gradient(to right, ${css(COOL)}, ${css(WARM)})` }), span("+1"));

    let point: Vec4 = [0, 0, 0, 0];
    let rung = 0;
    const values: HTMLElement[] = [];

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
        const axes = AXES.slice(0, Math.min(rung, 3)).map((_, k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH;
          return { from: end.map((x) => -x) as Vec4, to: end, alpha: AXIS_ALPHA };
        });
        const steps = walk(point, rung).map(([from, to]) => ({ from, to, alpha: WALK_ALPHA }));
        view.draw([...axes, ...steps]);
        labels.forEach((label, k) => {
          label.hidden = k >= rung;
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH + 0.1;
          place(label, end);
        });
        place(dot, point);
        dot.style.setProperty("--tint", css(tint(point[3])));
        values.forEach((value, k) => (value.textContent = fixed(point[k]!)));
        values[3]?.style.setProperty("color", css(tint(point[3])));
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return {
      show(step) {
        rung = RUNGS[step]!;
        point = onRung(point, rung);
        column.replaceChildren();
        values.length = 0;
        if (rung === 0) column.append(span("No numbers", "none"));
        for (const [k, axis] of AXES.slice(0, rung).entries()) {
          column.append(span(axis, "axis"));
          values.push(column.appendChild(span("")));
          addSlider(controls, axis, -1, 1, point[k]!, (x) => ((point[k] = x), schedule()));
        }
        legend.hidden = rung < 4;
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
