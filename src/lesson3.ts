// Lesson 3, "Counting corners and edges": extrusion says how to count. Each rung's shape
// is lesson 2's old copy, new copy and connecting edges; lighting a group up adds it to
// that rung's row of the count table, so the row's sums are the recurrence itself.

import { GROUPS, tally } from "./count.ts";
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
  { rung: 4, full: false },
];
const SANDBOX = STEPS.length - 1;
const TOP = 4;
// Unlit, the groups look as in lesson 2; while one is lit, the rest fade to a ghost.
const ALPHA: Record<Group, number> = { old: 0.35, new: 0.95, link: 0.7 };
const LIT = 0.95;
const GHOST = 0.08;
const DASH = 0.04;
const AXIS_REACH = 1.25;
const AXIS_ALPHA = 0.2;
const NAMES: Record<Group, string> = { old: "old copy", new: "new copy", link: "connecting edges" };

const hold = (text: string) => ({ text, hold: true });

export const lesson3: Lesson = {
  title: "Counting corners and edges",
  views: [{ caption: "Shadow", label: "A cube built from two copies of the one below it, one part lit to count" }, { caption: "Count" }],
  steps: [
    {
      text: `<p>Extrusion builds every cube from the one below it. It also tells you how to
        count one, without counting the picture corner by corner.</p><p>Start with a point:
        1 corner, no edges. That's the first row of the table.</p>`,
    },
    hold(`<p>1D: the segment is the point, its copy, and one edge joining them.</p><p>Light
      up each group below to count it into the table.</p>`),
    hold(`<p>2D: the square is the segment and its copy, 2 corners and 1 edge each, plus a
      connecting edge for each of the old segment's corners.</p><p>Count all three groups.</p>`),
    hold(`<p>3D: each copy of the square brings 4 corners and 4 edges, and each of the old
      square's 4 corners gets a connecting edge.</p>`),
    {
      text: `<p>So corners are the old copy's plus the new copy's: they double. Edges are both
        copies' edges, plus one connecting edge per old corner.</p><p>Before counting the
        tesseract, predict its row.</p>`,
      check: {
        prompts: [
          { label: "4D corners", answer: 16 },
          { label: "4D edges", answer: 32 },
        ],
        after: "16 corners, 8 + 8. 32 edges: 12 + 12 for the two cubes, and 8 connecting ones, one per corner of the cube.",
      },
    },
    hold(`<p>4D: the tesseract is the cube and its copy along w, joined corner to corner. Count
      it and check your prediction.</p><p>The new copy is warm: it sits at w&nbsp;=&nbsp;1.</p>`),
    {
      text: `<p>Each rung doubles the corners, starting from the point's 1, so you can keep going
        without a picture.</p><p>How many corners does a 10D cube have?</p>`,
      check: {
        prompts: [{ label: "10D", answer: 1024 }],
        after: `1024: 1 doubled ten times, 2<sup>10</sup>. An n-cube has V(n) = 2<sup>n</sup>
          corners, one for each list of n 0s and 1s: two choices per number.`,
      },
    },
    {
      text: `<p><strong>Sandbox.</strong> Pick a rung and light up each group to count it.</p>
        <p>Corners: V(n)&nbsp;=&nbsp;2·V(n&nbsp;−&nbsp;1).<br>Edges: E(n)&nbsp;=&nbsp;2·E(n&nbsp;−&nbsp;1)&nbsp;+&nbsp;V(n&nbsp;−&nbsp;1).</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, countFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const table = countFigure.appendChild(Object.assign(document.createElement("div"), { className: "count" }));

    let rung = 0;
    const counted = new Set<Group>();
    let lit: Group | null = null;
    let buttons: Record<Group, HTMLButtonElement> | undefined;

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { corners, edges } = extrude(rung, 1);
        const axes = [0, 1, 2].slice(0, Math.min(rung, 3)).map((k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH;
          return { from: end.map((x) => -x) as Vec4, to: end, alpha: AXIS_ALPHA };
        });
        const segments = edges.flatMap(({ a, b, group }) => {
          const alpha = lit === null ? ALPHA[group] : lit === group ? LIT : GHOST;
          const [from, to] = [corners[a]!, corners[b]!];
          const pieces: [Vec4, Vec4][] = group === "link" ? dashes(from, to, DASH) : [[from, to]];
          return pieces.map(([from, to]) => ({ from, to, alpha }));
        });
        view.draw([...axes, ...segments]);

        // A dot per corner, faded unless its copy is lit or nothing is.
        const half = corners.length / 2;
        marks.replaceChildren();
        corners.forEach((c, i) => {
          const copy: Group = i < half ? "old" : "new";
          const dot = marks.appendChild(span("", rung > 0 && lit !== null && lit !== copy ? "corner ghost" : "corner"));
          dot.style.setProperty("--tint", css(tint(c[3])));
          const [left, top] = view.screen(c);
          dot.style.left = `${left}px`;
          dot.style.top = `${top}px`;
        });

        // Rungs below this one are complete, this one has what's counted, later ones wait.
        table.replaceChildren(span("", "head"), span("corners", "head"), span("edges", "head"));
        for (let n = 0; n <= TOP; n++) {
          const row = n < rung ? tally(n, new Set(GROUPS)) : n === rung ? tally(n, counted) : { corners: "", edges: "" };
          const state = n === rung ? "now" : n > rung ? "later" : "";
          table.append(span(`${n}D`, `rung ${state}`), span(row.corners, state), span(row.edges, state));
        }
        if (buttons) for (const g of GROUPS) buttons[g].ariaPressed = String(lit === g);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    const reset = (full: boolean) => {
      counted.clear();
      if (full) for (const g of GROUPS) counted.add(g);
      lit = null;
      if (buttons) for (const g of GROUPS) Object.assign(buttons[g], { disabled: rung === 0, className: "" });
      schedule();
    };

    return {
      show(step, done) {
        const { rung: r, full } = STEPS[step]!;
        rung = r;
        buttons = undefined;
        if (step === SANDBOX) addSlider(controls, "rung", 0, TOP, rung, (x) => ((rung = x), reset(false)), (x) => `${x}D`, 1);
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
        }
        reset(full);
      },
      stop: () => resize.disconnect(),
    };
  },
};
