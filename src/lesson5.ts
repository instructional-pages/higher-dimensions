// Lesson 5, "Turning in a plane": the square turns about its corner (0, 0) by θ in the xy
// plane. Following (1, 0) defines cos θ and sin θ; any corner is a mix of (1, 0) and
// (0, 1), which gives the formula; and the formula's coefficients, as a 2×2 matrix, are
// multiplied by the corner's column one row at a time.

import type { Lesson } from "./lesson.ts";
import { AXES, type Vec4 } from "./math4d.ts";
import { createLineView, css, tint } from "./render.ts";
import { angleName, arc, snapAngle, turn } from "./turn.ts";
import { addSlider, fixed, span } from "./ui.ts";

// What the numbers view shows on a step.
type Panel = "none" | "angle" | "corners" | "formula" | "matrix" | "sandbox";

// Each step's rung (1 shows the segment, 2 the square), its numbers, which corners it
// follows (labelled, with their paths unless it's the sandbox, where four paths would
// crowd the square), the matrix row it multiplies out, and whether it has the xy slider.
const STEPS: { rung: number; panel: Panel; follow: number[]; row?: number; slider: boolean }[] = [
  { rung: 1, panel: "none", follow: [], slider: false },
  { rung: 2, panel: "angle", follow: [], slider: true },
  { rung: 2, panel: "angle", follow: [1], slider: false },
  { rung: 2, panel: "corners", follow: [1, 3], slider: true },
  { rung: 2, panel: "formula", follow: [2], slider: true },
  { rung: 2, panel: "matrix", follow: [2], row: 0, slider: true },
  { rung: 2, panel: "matrix", follow: [2], row: 1, slider: true },
  { rung: 2, panel: "sandbox", follow: [0, 1, 2, 3], slider: true },
];
const SANDBOX = STEPS.length - 1;
// The check starts from θ = 0, so the answer isn't on screen.
const CHECK = 2;
const SQUARE: Vec4[] = [
  [0, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [0, 1, 0, 0],
];
const SEGMENT: Vec4[] = [SQUARE[0]!, SQUARE[1]!];
// The turned square reaches √2 from the origin.
const AXIS_REACH = 1.6;
const AXIS_ALPHA = 0.2;
const EDGE_ALPHA = 0.95;
const FACE_ALPHA = 0.05;
// Where the square started.
const START_ALPHA = 0.25;
const PATH_ALPHA = 0.5;
const PATH_PIECES = 48;

// Two places, whole numbers bare, with a true minus sign.
const num = (x: number) => fixed(x).replace(/\.00$/, "").replace("-", "−");
const pair = ([x, y]: Vec4) => `(${num(x)}, ${num(y)})`;
// A factor that may be negative, bracketed when it is.
const factor = (x: number) => (num(x).startsWith("−") ? `(${num(x)})` : num(x));

export const lesson5: Lesson = {
  title: "Turning in a plane",
  views: [{ caption: "Shadow", label: "A square turning about its corner in the xy plane" }, { caption: "Numbers" }],
  steps: [
    {
      text: `<p>Start low. In 0D a point has nowhere to turn.</p><p>In 1D a segment can slide
        along its line, or flip end for end. A flip isn't a turn, though: there's no way to
        do half of one without leaving the line. A turn needs a second direction to turn
        toward.</p>`,
    },
    {
      text: `<p>In 2D there is one: x can turn toward y. A turn happens in a <em>plane</em>,
        here the xy plane, so its slider is named xy. It sets the angle of the turn, θ
        ("theta").</p><p>Angles here are in <em>radians</em>: a full turn is 2π, about 6.28,
        so half a turn is π and a quarter turn π/2. The slider lands exactly on each eighth
        of a turn.</p><p>The square turns about its corner (0, 0); the faint one is where it
        started. Drag xy.</p>`,
    },
    {
      text: `<p>A quarter turn, θ = π/2, swings the x direction onto y.</p><p>Where does the
        corner (1, 0) end up?</p>`,
      check: {
        prompts: [
          { label: "x′", answer: 0 },
          { label: "y′", answer: 1 },
        ],
        after: "(0, 1): the corner that was one step along x is now one step along y.",
      },
    },
    {
      text: `<p>Follow (1, 0) as it turns: it runs around a circle of radius 1. Its place after a
        turn of θ has a name: its x is <em>cos θ</em> (the cosine of θ) and its y is
        <em>sin θ</em> (the sine). So (1, 0) goes to (cos θ, sin θ).</p><p>The corner
        (0, 1) starts a quarter turn further round, so it goes to (−sin θ, cos θ).</p>
        <p>Drag xy and watch both.</p>`,
    },
    {
      text: `<p>Every other point follows from those two. The corner (1, 1) is one step along x
        plus one along y; each step turns as before, so it lands at their sum.</p><p>A point
        (x, y) is x steps along x plus y steps along y, so it turns to</p>
        <p class="formula">x′ = cos θ·x − sin θ·y<br>y′ = sin θ·x + cos θ·y</p>
        <p>x′ and y′ ("x prime", "y prime") are the new coordinates: a fixed mix of the
        old ones.</p>`,
    },
    {
      text: `<p>The mix can be written as a <em>matrix</em>, a grid of numbers. Its rows hold the
        formula's numbers: cos θ and −sin θ for x′, sin θ and cos θ for y′. The corner it
        turns is written as a column.</p><p>Each new coordinate is one row times the column:
        pair the row's numbers with the column's, multiply each pair, and add. The first row
        gives x′.</p>`,
    },
    {
      text: `<p>The second row times the same column gives y′.</p><p>That is all a matrix times
        a vector is: one row times the column for each new coordinate. The matrix is the
        turn, written down; the same 2×2 block will turn shapes in every plane of 3D and
        4D.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> Turn the square and read the matrix.</p><p>Try π:
        half a turn flips the sign of every coordinate. Then 2π: the matrix is the same as at
        0, since a full turn changes nothing.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, numbersFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const labels = AXES.slice(0, 2).map((axis) => marks.appendChild(span(axis, "label")));
    const dots = marks.appendChild(document.createElement("div"));
    const numbers = numbersFigure.appendChild(Object.assign(document.createElement("div"), { className: "numbers" }));

    let step = 0;
    let theta = 0;

    const place = (el: HTMLElement, v: Vec4) => {
      const [left, top] = view.screen(v);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    // The numbers view for the current step and θ; `corner` is the one being followed.
    const fill = (corner: Vec4) => {
      const { panel, row } = STEPS[step]!;
      const [c, s] = [Math.cos(theta), Math.sin(theta)];
      const [x, y] = corner;
      const [nx, ny] = turn(theta, corner);
      const line = (text: string) => numbers.appendChild(span(text, "line"));
      // The second line of a worked formula, indented under its first.
      const then = (text: string) => numbers.appendChild(span(`= ${text}`, "line then"));
      const angle = () => {
        const name = angleName(theta);
        line(`θ = ${name}${name.includes("π") ? ` ≈ ${theta.toFixed(2)}` : ""}`);
        numbers.appendChild(span(`${fixed(theta / (2 * Math.PI))} of a full turn`, "note"));
      };
      // A bracketed column of rows; row `lit` (if any) bright, the others dim.
      const bracket = (rows: string[][], lit?: number) => {
        const grid = Object.assign(document.createElement("div"), { className: "bracket" });
        grid.style.setProperty("--columns", String(rows[0]!.length));
        rows.forEach((cells, r) => grid.append(...cells.map((t) => span(t, lit !== undefined && r !== lit ? "dim" : ""))));
        return grid;
      };
      const matrix = [
        [num(c), num(-s)],
        [num(s), num(c)],
      ];

      numbers.replaceChildren();
      if (panel === "none") numbers.append(span("Nothing to turn", "note"));
      if (panel === "angle") angle();
      if (panel === "corners") {
        angle();
        line(`(1, 0) → (cos θ, sin θ) = ${pair(turn(theta, SQUARE[1]!))}`);
        line(`(0, 1) → (−sin θ, cos θ) = ${pair(turn(theta, SQUARE[3]!))}`);
      }
      if (panel === "formula") {
        angle();
        line(`x′ = cos θ·x − sin θ·y`);
        then(`${num(c)}·${x} − ${factor(s)}·${y} = ${num(nx)}`);
        line(`y′ = sin θ·x + cos θ·y`);
        then(`${num(s)}·${x} + ${num(c)}·${y} = ${num(ny)}`);
      }
      if (panel === "matrix") {
        angle();
        const product = numbers.appendChild(Object.assign(document.createElement("div"), { className: "product" }));
        product.append(bracket(matrix, row), bracket([[num(x)], [num(y)]]), span("="), bracket([[num(nx)], [num(ny)]], row));
        const [name, a, b, value] = row === 0 ? ["x′", c, -s, nx] : ["y′", s, c, ny];
        const [sa, sb] = row === 0 ? ["cos θ", "(−sin θ)"] : ["sin θ", "cos θ"];
        line(`${name} = ${sa}·x + ${sb}·y`);
        then(`${factor(a)}·${x} + ${factor(b)}·${y} = ${num(value)}`);
      }
      if (panel === "sandbox") {
        angle();
        numbers.append(bracket(matrix));
        const table = numbers.appendChild(Object.assign(document.createElement("div"), { className: "turned" }));
        for (const v of SQUARE) table.append(span(pair(v)), span("→"), span(pair(turn(theta, v))));
      }
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { rung, follow } = STEPS[step]!;
        const shape = rung === 1 ? SEGMENT : SQUARE;
        const turned = shape.map((v) => turn(theta, v));
        const ring = (corners: Vec4[], alpha: number) => corners.map((from, i) => ({ from, to: corners[(i + 1) % corners.length]!, alpha }));
        const axes = AXES.slice(0, rung).map((_, k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH;
          return { from: end.map((x) => -x) as Vec4, to: end, alpha: AXIS_ALPHA };
        });
        const edges = rung === 1 ? [{ from: turned[0]!, to: turned[1]!, alpha: EDGE_ALPHA }] : ring(turned, EDGE_ALPHA);
        const start = rung === 2 && theta !== 0 ? ring(SQUARE, START_ALPHA) : [];
        const paths = (step === SANDBOX ? [] : follow).flatMap((i) => arc(theta, SQUARE[i]!, PATH_PIECES).map(([from, to]) => ({ from, to, alpha: PATH_ALPHA })));
        view.draw([...axes, ...start, ...paths, ...edges], rung === 2 ? [{ corners: turned, alpha: FACE_ALPHA }] : []);
        labels.forEach((label, k) => {
          label.hidden = k >= rung;
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH + 0.1;
          place(label, end);
        });

        // A dot per corner; the followed ones carry their coordinates, in 1D a single
        // number each.
        dots.replaceChildren();
        turned.forEach((v, i) => {
          const followed = rung === 1 || follow.includes(i);
          const text = rung === 1 ? `(${num(v[0])})` : followed ? pair(v) : "";
          const dot = dots.appendChild(span(text, followed ? "corner new" : "corner"));
          dot.style.setProperty("--tint", css(tint(v[3])));
          place(dot, v);
        });
        fill(SQUARE[follow.at(-1) ?? 1]!);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return {
      show(i) {
        step = i;
        if (i === CHECK) theta = 0;
        if (STEPS[i]!.slider)
          addSlider(controls, "xy", 0, 2 * Math.PI, theta, (x) => ((theta = snapAngle(x)), schedule()), (x) => angleName(snapAngle(x)));
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
