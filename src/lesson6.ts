// Lesson 6, "Planes, not axes": a turn happens in a plane, and the "axis" is only what it
// leaves still. One plane per pair of directions (0, 0, 1, 3, 6 up the rungs); each 3D
// plane's matrix is lesson 5's 2×2 block in two rows and columns of the identity; several
// sliders multiply their matrices in the panel's fixed order; and turns in different
// planes don't commute, shown on the corner (1, 0, 0) with a swap-order toggle.

import type { Lesson } from "./lesson.ts";
import { AXES, apply, identity, rotation, type Plane, type Vec4 } from "./math4d.ts";
import { corner, inBlock, inOrder, planeCount, planesOf } from "./planes.ts";
import { createLineView, css, tint } from "./render.ts";
import { angleName, arc, snapAngle } from "./turn.ts";
import { addSlider, bracket, coords, num, span } from "./ui.ts";

// What the numbers view shows on a step.
type Panel = "still" | "ladder" | "ladder4" | "block" | "three" | "product" | "orders" | "swap" | "sandbox";

// The 3D planes, in the panel's fixed order: xy is applied first.
const TURNS: Plane[] = ["xy", "xz", "yz"];

// Each step's numbers, the planes it may leave turned (the others go back to 0), whether
// it has their sliders, and the corners it labels.
const STEPS: { panel: Panel; planes: Plane[]; sliders: boolean; follow: Vec4[] }[] = [
  { panel: "still", planes: ["xy"], sliders: true, follow: [[1, 0, 0, 0], [0, 0, 1, 0]] },
  { panel: "ladder", planes: ["xy"], sliders: false, follow: [] },
  { panel: "ladder4", planes: ["xy"], sliders: false, follow: [] },
  { panel: "block", planes: ["xy"], sliders: true, follow: [] },
  { panel: "block", planes: ["xy"], sliders: false, follow: [] },
  { panel: "three", planes: TURNS, sliders: true, follow: [] },
  { panel: "product", planes: TURNS, sliders: true, follow: [[1, 0, 0, 0]] },
  { panel: "orders", planes: [], sliders: false, follow: [[1, 0, 0, 0]] },
  { panel: "swap", planes: [], sliders: false, follow: [[1, 0, 0, 0]] },
  { panel: "sandbox", planes: TURNS, sliders: true, follow: [[1, 0, 0, 0]] },
];
const SWAP = 8;
const ZERO = { xy: 0, xz: 0, yz: 0, xw: 0, yw: 0, zw: 0 };
const QUARTER = Math.PI / 2;
// The two orders of the swap step, as turns made one after another.
const ORDERS: [Plane, number][][] = [
  [
    ["xy", QUARTER],
    ["xz", QUARTER],
  ],
  [
    ["xz", QUARTER],
    ["xy", QUARTER],
  ],
];

// The cube at its true 0/1 coordinates: corner i has coordinate k equal to bit k of i.
const CUBE: Vec4[] = [...Array(8).keys()].map((i) => [i & 1, (i >> 1) & 1, (i >> 2) & 1, 0]);
const EDGES = [...Array(8).keys()].flatMap((i) => [1, 2, 4].filter((b) => !(i & b)).map((b) => [i, i | b] as const));
// The six squares, corners in order around each: the pair of bits it spans, either side.
const FACES = [
  [1, 2],
  [1, 4],
  [2, 4],
].flatMap(([a, b]) => [0, 7 - a! - b!].map((base) => [base, base | a!, base | a! | b!, base | b!]));
// The turned cube reaches √3 from the origin.
const AXIS_REACH = 1.9;
const AXIS_ALPHA = 0.2;
const EDGE_ALPHA = 0.95;
const FACE_ALPHA = 0.05;
// Where the cube started, and on the swap step the other order's cube.
const FAINT_ALPHA = 0.25;
const PATH_ALPHA = 0.5;
const PATH_PIECES = 32;

const triple = (v: Vec4) => coords(v, 3);
const rows3 = (m: number[]) => corner(m, 3).map((row) => row.map(num));

export const lesson6: Lesson = {
  title: "Planes, not axes",
  views: [{ caption: "Shadow", label: "A cube turning about its corner in the xy, xz and yz planes" }, { caption: "Numbers" }],
  steps: [
    {
      text: `<p>In 3D we usually say a thing turns <em>around an axis</em>. Drag xy: the cube
        turns "around z".</p><p>But look at what moves. Every corner keeps its z; only its x
        and y change. The turn happens in the xy plane, exactly as the square turned in
        lesson 5. The z axis is just what the turn leaves still.</p>`,
    },
    {
      text: `<p>So a turn is named by its plane, and there is one plane for each pair of
        directions: one direction turning toward another.</p><p>0D and 1D have none: a turn
        needs two directions. 2D has one, xy. 3D has three: xy, xz and yz. Each leaves the
        third direction still, which is why 3D can get away with naming the axis.</p>`,
    },
    {
      text: `<p>4D has four directions, x, y, z and w.</p><p>How many planes can it turn in?</p>`,
      check: {
        prompts: [{ label: "4D planes", answer: 6 }],
        after: `6: xy, xz, xw, yz, yw and zw, one for each pair, the same count as the
          tesseract's 6 kinds of square in lesson 4. The xy turn now leaves both z and w still:
          a whole plane, not an axis. "Around an axis" stops making sense in 4D, but "in a
          plane" still works.`,
      },
    },
    {
      text: `<p>The xy turn's matrix in 3D is lesson 5's 2×2 block, cos θ and sin θ, in the x
        and y rows and columns. The z row and column are the <em>identity</em>'s: a 1 where
        they cross, 0 elsewhere.</p><p>So the z row gives z′ = 0·x + 0·y + 1·z = z, and z
        never changes. Drag xy and watch only the bright entries move.</p>`,
    },
    {
      text: `<p>The xz turn is built the same way: the 2×2 block goes in the rows and columns
        of the two directions it turns.</p><p>Which coordinate does it leave unchanged?</p>`,
      check: {
        prompts: [{ label: "Unchanged", choices: ["x", "y", "z"], answer: "y" }],
        after: `y: its block fills the x and z rows and columns, so the y row is 0, 1, 0, and
          y′ = y.`,
      },
    },
    {
      text: `<p>Here are all three planes of 3D, each with its own slider and its own matrix:
        the block in its two rows and columns, the identity in the third.</p><p>Drag one at a
        time, then try more than one.</p>`,
    },
    {
      text: `<p>With more than one slider set, the cube turns in xy first, then xz, then yz,
        always in the order of the panel. Doing one turn after another multiplies their
        matrices, the later turn on the left:</p><p class="formula">M = yz · xz · xy</p>
        <p>M times a corner's column gives where it lands, so the result can be read off the
        single matrix.</p>`,
    },
    {
      text: `<p>Does the order matter? Turn by π/2 in xy, then by π/2 in xz. Or the other way
        round: xz first, then xy.</p>`,
      check: {
        prompts: [{ label: "Same cube either way?", choices: ["yes", "no"], answer: "no" }],
        after: `No: the corner (1, 0, 0) lands on (0, 1, 0) one way and on (0, 0, 1) the
          other.`,
      },
    },
    {
      text: `<p>Follow (1, 0, 0). xy first swings it onto y, to (0, 1, 0), and then xz leaves
        it alone, since it has no x or z left to turn. xz first swings it onto z, to
        (0, 0, 1), and then xy leaves it alone.</p><p>Swap the order and compare: the two
        products differ, so turns in different planes don't <em>commute</em>. That's why the
        sliders keep one fixed order.</p>`,
      hold: true,
    },
    {
      text: `<p><strong>Sandbox.</strong> Turn the cube in all three planes and read the
        matrix.</p><p>Try xz at π/2 and yz at π/2 together, then compare with what each does
        alone.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, numbersFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const labels = AXES.slice(0, 3).map((axis) => marks.appendChild(span(axis, "label")));
    const dots = marks.appendChild(document.createElement("div"));
    const numbers = numbersFigure.appendChild(Object.assign(document.createElement("div"), { className: "numbers" }));

    let step = 0;
    const angles = { ...ZERO };
    // On the swap step, which of ORDERS is shown bright.
    let order = 0;

    const place = (el: HTMLElement, v: Vec4) => {
      const [left, top] = view.screen(v);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    // The numbers view for the current step; `m` is the turn drawn bright.
    const fill = (m: number[]) => {
      const { panel } = STEPS[step]!;
      const line = (text: string, className = "line") => numbers.appendChild(span(text, className));
      const row = (className: string) => numbers.appendChild(Object.assign(document.createElement("div"), { className }));
      const angle = (plane: Plane) => line(`${plane} = ${angleName(angles[plane])}`);
      // A plane's matrix at its slider's angle, the identity's entries dim.
      const planeMatrix = (plane: Plane) => bracket(rows3(rotation({ ...ZERO, [plane]: angles[plane] })), (r, c) => !inBlock(plane, r, c));
      const product = (m: number[], v: Vec4) => {
        const out = row("product");
        out.append(bracket(rows3(m)), bracket(v.slice(0, 3).map((x) => [num(x)])), span("="), bracket(apply(m, v).slice(0, 3).map((x) => [num(x)])));
      };

      numbers.replaceChildren();
      if (panel === "still") {
        angle("xy");
        for (const v of [CUBE[1]!, CUBE[4]!]) line(`${triple(v)} → ${triple(apply(m, v))}`);
        numbers.appendChild(span("z′ = z for every corner", "note"));
      }
      if (panel === "ladder" || panel === "ladder4") {
        const ladder = row("ladder");
        for (let n = 0; n <= (panel === "ladder" ? 3 : 4); n++) {
          const hidden = n === 4;
          ladder.append(span(`${n}D`, "dim"), span(hidden ? "?" : planesOf(n).join(" ") || "none"), span(hidden ? "" : String(planeCount(n))));
        }
      }
      if (panel === "block") {
        angle("xy");
        numbers.append(planeMatrix("xy"));
        numbers.appendChild(span("rows and columns x, y, z", "note"));
      }
      if (panel === "three") {
        const three = row("three");
        for (const plane of TURNS) {
          const column = three.appendChild(document.createElement("div"));
          column.append(span(`${plane} = ${angleName(angles[plane])}`), planeMatrix(plane));
        }
      }
      if (panel === "product" || panel === "sandbox") {
        line(TURNS.map((p) => `${p} = ${angleName(angles[p])}`).join(", "));
        line("M = yz · xz · xy");
        product(m, CUBE[1]!);
      }
      if (panel === "orders") {
        for (const steps of ORDERS) line(`${steps.map(([p]) => `${p} by π/2`).join(", then ")}: ?`);
      }
      if (panel === "swap") {
        const both = row("orders");
        ORDERS.forEach((steps, k) => {
          const column = both.appendChild(Object.assign(document.createElement("div"), { className: k === order ? "" : "dim" }));
          const turned = inOrder(steps);
          column.append(
            span(`${steps[0]![0]} first, then ${steps[1]![0]}`),
            span(`M = ${steps[1]![0]} · ${steps[0]![0]}`),
            bracket(rows3(turned)),
            span(`(1, 0, 0) → ${triple(apply(turned, CUBE[1]!))}`),
          );
        });
      }
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { follow, panel } = STEPS[step]!;
        const swap = step === SWAP;
        const m = swap ? inOrder(ORDERS[order]!) : rotation(angles);
        const cube = (turn: number[], alpha: number) =>
          EDGES.map(([a, b]) => ({ from: apply(turn, CUBE[a]!), to: apply(turn, CUBE[b]!), alpha }));
        const axes = [0, 1, 2].map((k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH;
          return { from: end.map((x) => -x) as Vec4, to: end, alpha: AXIS_ALPHA };
        });
        // The other order's cube on the swap step; elsewhere, where the cube started.
        const faint = swap ? cube(inOrder(ORDERS[1 - order]!), FAINT_ALPHA) : TURNS.some((p) => angles[p] !== 0) ? cube(identity(), FAINT_ALPHA) : [];
        // (1, 0, 0)'s path: in xy while it's the only plane, or the swap step's two legs.
        const paths = swap
          ? ORDERS[order]!.reduce<{ at: Vec4; legs: [Vec4, Vec4][] }>(
              ({ at, legs }, [plane, theta]) => ({ at: apply(inOrder([[plane, theta]]), at), legs: [...legs, ...arc(theta, at, PATH_PIECES, plane)] }),
              { at: CUBE[1]!, legs: [] },
            ).legs
          : panel === "still"
            ? arc(angles.xy, CUBE[1]!, PATH_PIECES)
            : [];
        view.draw(
          [...axes, ...faint, ...paths.map(([from, to]) => ({ from, to, alpha: PATH_ALPHA })), ...cube(m, EDGE_ALPHA)],
          FACES.map((face) => ({ corners: face.map((i) => apply(m, CUBE[i]!)), alpha: FACE_ALPHA })),
        );
        labels.forEach((label, k) => {
          const end: Vec4 = [0, 0, 0, 0];
          end[k] = AXIS_REACH + 0.1;
          place(label, end);
        });

        // A dot per corner; the followed ones carry their coordinates.
        dots.replaceChildren();
        CUBE.forEach((v) => {
          const followed = follow.some((f) => f.every((x, k) => x === v[k]));
          const at = apply(m, v);
          const dot = dots.appendChild(span(followed ? triple(at) : "", followed ? "corner new" : "corner"));
          dot.style.setProperty("--tint", css(tint(at[3])));
          place(dot, at);
          if (followed && swap) {
            const other = apply(inOrder(ORDERS[1 - order]!), v);
            const ghost = dots.appendChild(span(triple(other), "corner"));
            ghost.style.setProperty("--tint", css(tint(other[3])));
            place(ghost, other);
          }
        });
        fill(m);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return {
      show(i, done) {
        step = i;
        const { planes, sliders } = STEPS[i]!;
        for (const plane of TURNS) if (!planes.includes(plane)) angles[plane] = 0;
        if (sliders)
          for (const plane of planes)
            addSlider(controls, plane, 0, 2 * Math.PI, angles[plane], (x) => ((angles[plane] = snapAngle(x)), schedule()), (x) => angleName(snapAngle(x)));
        if (i === SWAP) {
          order = 0;
          const button = Object.assign(document.createElement("button"), { type: "button", textContent: "Swap order" });
          button.addEventListener("click", () => {
            order = 1 - order;
            done();
            schedule();
          });
          controls.append(button);
        }
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
