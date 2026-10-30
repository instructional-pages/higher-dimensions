// Lesson 4, "Squares, cubes and beyond": lesson 3's count, for pieces of every size. The
// same three groups (old copy, new copy, swept pieces) fill a row of corners, edges,
// squares and cubes; the swept pieces' faces are filled so the swept squares show. Ends
// in the closed form and a sandbox stepping through the tesseract's 8 cubes.

import { GROUPS, tally, written, type Cell } from "./count.ts";
import { dashes, extrude, type Group } from "./extrude.ts";
import type { Lesson } from "./lesson.ts";
import type { Vec4 } from "./math4d.ts";
import { createLineView, css, tint } from "./render.ts";
import { addSlider, span } from "./ui.ts";

// Each step's rung, and whether it starts with every group already counted.
const STEPS: { rung: number; full: boolean }[] = [
  { rung: 0, full: true },
  { rung: 1, full: false },
  { rung: 2, full: false },
  { rung: 3, full: false },
  { rung: 3, full: true },
  { rung: 4, full: false },
  { rung: 4, full: true },
  { rung: 4, full: true },
  { rung: 4, full: true },
];
const SANDBOX = STEPS.length - 1;
const TOP = 4;
const SIZES = ["corners", "edges", "squares", "cubes"];
// Unlit, the groups look as in lesson 2 with very faint squares; while one is lit (or a
// cube, in the sandbox), its edges are bright and its squares filled, the rest a ghost.
const ALPHA: Record<Group, number> = { old: 0.35, new: 0.95, link: 0.7 };
const FACE = 0.03;
const LIT = 0.95;
const FILL = 0.1;
const GHOST = 0.08;
const DASH = 0.04;
const AXIS_REACH = 1.25;
const AXIS_ALPHA = 0.2;
const NAMES: Record<Group, string> = { old: "old copy", new: "new copy", link: "swept pieces" };
// The tesseract's 8 cubes: each holds one coordinate at 0 or 1. Corner i of the tesseract
// has coordinate j equal to bit j of i.
const CUBES = [0, 1, 2, 3].flatMap((axis) => [0, 1].map((side) => ({ axis, side })));
const inCube = (i: number, { axis, side }: { axis: number; side: number }) => ((i >> axis) & 1) === side;

const hold = (text: string) => ({ text, hold: true });

// A table cell. The small view has room only for totals, so it hides the sum.
const cell = ({ sum, total }: Cell, state: string) => {
  const el = span(total, state);
  if (sum) el.prepend(span(total ? `${sum} = ` : sum, "sum"));
  return el;
};

export const lesson4: Lesson = {
  title: "Squares, cubes and beyond",
  views: [{ caption: "Shadow", label: "A cube built from two copies of the one below it, one part lit to count" }, { caption: "Count" }],
  steps: [
    {
      text: `<p>Lesson 3 counted corners and edges. The same rule counts pieces of every size:
        squares, cubes, and on up.</p><p>When a shape is swept along a new direction, each
        piece of the new shape belongs to the old copy, to the new copy, or is a piece one
        size smaller, swept: a corner sweeps out an edge, an edge a square, a square a
        cube.</p>`,
    },
    hold(`<p>1D: the point, its copy, and the point swept into an edge.</p><p>Light up each
      group below to count it into every column.</p>`),
    hold(`<p>2D: each copy of the segment brings 2 corners and 1 edge. Swept, its 2 corners
      make the 2 connecting edges, and its edge makes a square: the square itself.</p>`),
    hold(`<p>3D: each copy of the square brings 4 corners, 4 edges and 1 square. Swept, its 4
      corners make 4 edges, its 4 edges make the cube's 4 side squares, and the square makes
      the cube.</p>`),
    {
      text: `<p>So each column is both copies' pieces of that size, plus one swept piece for
        each of the old copy's pieces one size smaller: the column to its left.</p><p>Before
        counting the tesseract, predict its squares and cubes.</p>`,
      check: {
        prompts: [
          { label: "4D squares", answer: 24 },
          { label: "4D cubes", answer: 8 },
        ],
        after: `24 squares: 6 + 6 for the two cubes, and 12 swept, one for each edge of the
          cube. 8 cubes: 1 + 1, and 6 swept, one for each square of the cube.`,
      },
    },
    hold(`<p>4D: the tesseract is the cube and its copy along w, and everything swept between
      them. Count it and check your prediction.</p><p>Each swept square joins an edge of the
      cool cube to its copy in the warm one.</p>`),
    {
      text: `<p>Write F(n,&nbsp;k) for the number of k&#8209;dimensional pieces of an n-cube: the
        tesseract has F(4,&nbsp;2)&nbsp;=&nbsp;24 squares. The rule is
        F(n,&nbsp;k)&nbsp;=&nbsp;2·F(n&nbsp;−&nbsp;1,&nbsp;k) + F(n&nbsp;−&nbsp;1,&nbsp;k&nbsp;−&nbsp;1).</p>
        <p>No picture now. A 5D cube is the tesseract and its copy along a fifth direction.
        From the 4D row, predict its corners, edges and squares.</p>`,
      check: {
        prompts: [
          { label: "5D corners", answer: 32 },
          { label: "5D edges", answer: 80 },
          { label: "5D squares", answer: 80 },
        ],
        after: `32 corners: 16 + 16. 80 edges: 32 + 32, and 16 swept, one per corner of the
          tesseract. 80 squares: 24 + 24, and 32 swept, one per edge.`,
      },
    },
    {
      text: `<p>There is also a way straight to any count. A square of the tesseract spans 2
        of the 4 directions, and in each of the other 2 it sits at 0 or at 1.</p><p>Which 2
        directions: xy, xz, xw, yz, yw or zw, 6 ways. This is C(4,&nbsp;2), "4 choose 2":
        the ways to choose 2 things out of 4, (4·3)&nbsp;/&nbsp;(2·1). Which side in the other 2:
        2·2&nbsp;=&nbsp;4 ways. 6·4&nbsp;=&nbsp;24 squares.</p><p>For any n and k:
        F(n,&nbsp;k)&nbsp;=&nbsp;C(n,&nbsp;k)·2<sup>n−k</sup>.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> Step through the tesseract's 8 cubes.</p><p>Each
        holds one coordinate at 0 or at 1 and spans the other three:
        C(4,&nbsp;3)·2&nbsp;=&nbsp;4·2&nbsp;=&nbsp;8. Most look squashed in the shadow, but
        all eight are the same cube.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, countFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const table = countFigure.appendChild(Object.assign(document.createElement("div"), { className: "count" }));
    table.style.setProperty("--columns", String(SIZES.length + 1));

    let rung = 0;
    const counted = new Set<Group>();
    let lit: Group | null = null;
    // The sandbox's lit cube, an index into CUBES.
    let cube: number | null = null;
    let buttons: Record<Group, HTMLButtonElement> | undefined;
    // The row being counted, written out under the buttons.
    let sums: HTMLElement | undefined;

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { corners, edges, faces } = extrude(rung, 1);
        // Whether a piece (its group, its corners) is lit, ghosted or neither (null).
        const isLit = (group: Group, ends: number[]): boolean | null =>
          cube !== null ? ends.every((i) => inCube(i, CUBES[cube!]!)) : lit === null ? null : lit === group;
        const axes = [0, 1, 2].slice(0, Math.min(rung, 3)).map((k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH;
          return { from: end.map((x) => -x) as Vec4, to: end, alpha: AXIS_ALPHA };
        });
        const segments = edges.flatMap(({ a, b, group }) => {
          const on = isLit(group, [a, b]);
          const alpha = on === null ? ALPHA[group] : on ? LIT : GHOST;
          const [from, to] = [corners[a]!, corners[b]!];
          const pieces: [Vec4, Vec4][] = group === "link" ? dashes(from, to, DASH) : [[from, to]];
          return pieces.map(([from, to]) => ({ from, to, alpha }));
        });
        const squares = faces.flatMap(({ corners: ends, group }) => {
          const on = isLit(group, ends);
          return on === false ? [] : [{ corners: ends.map((i) => corners[i]!), alpha: on ? FILL : FACE }];
        });
        view.draw([...axes, ...segments], squares);

        // A dot per corner, faded unless its copy (or cube) is lit, or nothing is.
        const half = corners.length / 2;
        marks.replaceChildren();
        corners.forEach((c, i) => {
          const on = isLit(i < half ? "old" : "new", [i]);
          const dot = marks.appendChild(span("", rung > 0 && on === false ? "corner ghost" : "corner"));
          dot.style.setProperty("--tint", css(tint(c[3])));
          const [left, top] = view.screen(c);
          dot.style.left = `${left}px`;
          dot.style.top = `${top}px`;
        });

        // Rungs below this one are complete, this one has what's counted, later ones wait.
        table.replaceChildren(span("", "head"), ...SIZES.map((s) => span(s, "head")));
        for (let n = 0; n <= TOP; n++) {
          const row = n <= rung ? tally(n, n < rung ? new Set(GROUPS) : counted, SIZES.length) : SIZES.map(() => ({ sum: "", total: "" }));
          const state = n === rung ? "now" : n > rung ? "later" : "";
          table.append(span(`${n}D`, `rung ${state}`), ...row.map((c) => cell(c, state)));
        }
        sums?.replaceChildren(...tally(rung, counted, SIZES.length).flatMap((c, k) => [span(SIZES[k]!, "head"), span(written(c))]));
        if (buttons) for (const g of GROUPS) buttons[g].ariaPressed = String(lit === g);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return {
      show(step, done) {
        const { rung: r, full } = STEPS[step]!;
        rung = r;
        buttons = undefined;
        sums = undefined;
        counted.clear();
        if (full) for (const g of GROUPS) counted.add(g);
        lit = null;
        cube = null;
        if (step === SANDBOX) {
          const name = (x: number) => `${"xyzw"[CUBES[x]!.axis]}\u00a0=\u00a0${CUBES[x]!.side}`;
          addSlider(controls, "cube", 0, CUBES.length - 1, 0, (x) => ((cube = x), schedule()), name, 1);
          cube = 0;
        }
        if (!full) {
          // Lighting a group counts it; pressing the lit one again shows the whole shape.
          const row = controls.appendChild(Object.assign(document.createElement("div"), { className: "groups" }));
          const make = (g: Group) => {
            const button = row.appendChild(Object.assign(document.createElement("button"), { type: "button", textContent: NAMES[g] }));
            button.addEventListener("click", () => {
              lit = lit === g ? null : g;
              counted.add(g);
              button.className = "counted";
              if (counted.size === GROUPS.length) done();
              schedule();
            });
            return button;
          };
          buttons = { old: make("old"), new: make("new"), link: make("link") };
          sums = controls.appendChild(Object.assign(document.createElement("div"), { className: "sums" }));
        }
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
