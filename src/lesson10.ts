// Lesson 10, "Slicing a turning shape": the course's main goal, predicting what a slice
// does next while the shape turns. The rule: a turned corner's w is the matrix's bottom
// row times where the corner started, so only the turns that mix in w (xw, yw, zw)
// change which points the cut keeps; xy, xz and yz alone only turn the slice. The ladder
// turns a cube in xz cut by z = 0 (a square stretching into a rectangle and back), then
// the tesseract in xw cut by w = 0 (a cube stretching into a box and back), a turn
// button moving π/8 a press so the learner can guess before each one. Three rounds ask
// for the next slice out of three pictures, then a second plane into w tilts the cut
// against the shape and hexagons appear. The sandbox has all six turns and the cut.

import { cutCube, levels, sliceName, snapCut, turnedCube, leadTurn } from "./cut.ts";
import type { Lesson } from "./lesson.ts";
import { PLANES, rotation, type Angles, type Plane, type Vec4 } from "./math4d.ts";
import { createLineView, createSliceView } from "./render.ts";
import { cube } from "./shadow.ts";
import type { Slice } from "./slice.ts";
import { thumbnail } from "./thumb.ts";
import { angleName, snapAngle } from "./turn.ts";
import { angles, boxSize, cutRow, rowFormula, STEP, turningSlice } from "./turning.ts";
import { addSlider, bracket, num, span } from "./ui.ts";

// What the numbers view shows on a step.
type Panel = "turn" | "round" | "sandbox";

// Each step's rung, where its angles start, the planes it has turn buttons or sliders
// for, the plane whose turn to π/2 lets Next on, and on a check round the turn it asks
// about and the angles the reveal turns to.
const STEPS: { rung: number; panel: Panel; start: Partial<Angles>; buttons?: Plane[]; sliders?: Plane[]; hold?: Plane; ask?: string; reveal?: Partial<Angles> }[] = [
  { rung: 4, panel: "turn", start: {}, sliders: ["xy", "xz", "yz"] },
  { rung: 3, panel: "turn", start: {}, buttons: ["xz"], hold: "xz" },
  { rung: 4, panel: "turn", start: {}, buttons: ["xw"], hold: "xw" },
  { rung: 4, panel: "turn", start: {}, buttons: ["yw", "zw"] },
  { rung: 4, panel: "round", start: { yw: STEP }, ask: "yw = π/4", reveal: { yw: 2 * STEP } },
  { rung: 4, panel: "round", start: { zw: 3 * STEP }, ask: "zw = π/2", reveal: { zw: 4 * STEP } },
  { rung: 4, panel: "round", start: { xw: 2 * STEP }, ask: "yw = π/8 as well", reveal: { xw: 2 * STEP, yw: STEP } },
  { rung: 4, panel: "turn", start: { xw: 2 * STEP, yw: STEP }, buttons: ["yw", "zw"] },
  { rung: 4, panel: "sandbox", start: {}, sliders: [...PLANES] },
];
const SANDBOX = STEPS.length - 1;
const QUARTER = Math.PI / 2;
const FULL = 2 * Math.PI;

const EDGE_ALPHA = 0.95;
const DIM_EDGE = 0.35;
const FACE_ALPHA = 0.03;
const SLICE_FILL = 0.3;
const CUT_ALPHA = 0.2;
const CUT_FILL = 0.02;
const CUT_REACH = 2.2;

// The check rounds' pictures, all at w = 0.
const picture = (s: Slice, title: string) => thumbnail(s, 0, title);
const box = (some: Partial<Angles>) => turningSlice(4, some);
const OCTAHEDRON = cutCube(4, turnedCube(4, leadTurn(4, 0)), 0);
const round = (pictures: string[], answer: string) => ({
  prompts: [{ label: "Next slice", choices: ["A", "B", "C"], answer, pictures }],
});

export const lesson10: Lesson = {
  title: "Slicing a turning shape",
  views: [
    { caption: "Slice", label: "The slice of a turning shape, as the viewer one dimension down sees it" },
    { caption: "Cut", label: "The turning shape faint with its slice bright inside it; the tesseract as its shadow" },
    { caption: "Numbers" },
  ],
  steps: [
    {
      text: `<p>This is what the course has been building to: predicting what a slice does
        while the shape turns.</p><p>Start with lesson 9's straight-on cut: the tesseract cut
        by w = 0 is a cube. Turn it in xy, xz and yz. The slice turns with it, but stays the
        same 2 × 2 × 2 cube.</p><p>Numbers shows why. A turned corner's w is the matrix's
        bottom row times where the corner started. These turns leave that row 0, 0, 0, 1,
        so the cut keeps the same points, only turned.</p>`,
    },
    {
      text: `<p>One rung down first. A cube turns in xz, the plane that mixes in z, while the
        cut z = 0 stays put. Each press of Turn turns it π/8.</p><p>Before each press, guess
        what the slice will do. Keep going until xz reaches π/2.</p>`,
      hold: true,
    },
    {
      text: `<p>The square stretched along x into a rectangle, longest at π/4 (2√2 ≈ 2.83,
        the square's diagonal), and was a square again by π/2.</p><p>Now the tesseract
        turning in xw, cut by w = 0: the same move one rung up. Guess before each press:
        what does the cube slice do? Keep going until xw reaches π/2.</p>`,
      hold: true,
    },
    {
      text: `<p>Just like the square: the cube stretched along x into a box, longest at π/4,
        and was a cube again at π/2. There w′ = x, so the cut keeps the points where x = 0:
        a different cube, the tesseract's middle across x.</p><p>yw and zw do the same along
        y and along z. Try each; Back to start resets them.</p>`,
    },
    {
      text: `<p>Your turn to predict. yw is at π/8. Which is the slice after one more press,
        at yw = π/4?</p>`,
      check: {
        ...round([picture(box({ xw: 2 * STEP }), "a box 2.83 long along x"), picture(box({ yw: 2 * STEP }), "a box 2.83 long along y"), picture(box({ yw: STEP }), "a box 2.16 long along y, as now")], "B"),
        after: `B. yw does along y what xw does along x: from π/8 to π/4 the box keeps
          stretching along y, to its longest, 2.83. A stretches along x, which yw doesn't
          touch.`,
      },
    },
    {
      text: `<p>zw is at 3π/8, and the box is shrinking back along z. Which is the slice one
        press later, at zw = π/2?</p>`,
      check: {
        ...round([picture(box({}), "a cube"), picture(box({ zw: 2 * STEP }), "a box 2.83 long along z"), picture(box({ zw: 3 * STEP }), "a box 2.16 long along z, as now")], "A"),
        after: `A, a cube again. At π/2, w′ = z, so the cut keeps the points where z = 0:
          the tesseract's middle across z, a 2 × 2 × 2 cube.`,
      },
    },
    {
      text: `<p>xw is at π/4: the box is longest along x. Now turn yw by π/8 as well. Which
        is the slice?</p>`,
      check: {
        ...round([picture(box({ xw: 2 * STEP }), "the same box"), picture(OCTAHEDRON, "an octahedron"), picture(box({ xw: 2 * STEP, yw: STEP }), "a hexagonal prism")], "C"),
        after: `C, a prism with hexagons at its ends. The cut now tilts against the shape in
          x and y at once, like lesson 9's plane meeting a cube aslant: across x, y and w it
          cuts a hexagon. z is still untouched, so the hexagon runs straight along z: 2
          hexagons and 6 four-sided faces.`,
      },
    },
    {
      text: `<p>Keep pressing Turn yw. The hexagons change, and at yw = π/2 the slice is a
        cube again: then w′ = y, and xw no longer matters.</p><p>Add zw as well: the cut
        tilts in a third direction and the faces change again. Throughout, only xw, yw and
        zw change the slice, and the bottom row in Numbers says how.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> All six turns, and the cut h.</p><p>xy, xz and yz
        alone only turn the slice. Once xw, yw or zw is turned, they change it too: they
        turn the shape first (xy first, zw last), so they change which way the cut runs
        across it. Predict, then move a slider and see.</p>`,
    },
  ],
  start(figures, controls) {
    const [sliceFigure, cutFigure, numbersFigure] = figures as [HTMLElement, HTMLElement, HTMLElement];
    const sliceCanvas = sliceFigure.querySelector("canvas")!;
    const cutCanvas = cutFigure.querySelector("canvas")!;
    const sliceView = createSliceView(sliceCanvas);
    const view = createLineView(cutCanvas);
    if (!view || !sliceView) return null;
    const numbers = numbersFigure.appendChild(Object.assign(document.createElement("div"), { className: "numbers" }));

    let step = 0;
    let h = 0;
    let revealed = false;
    let turned = angles();

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const n = STEPS[step]!.rung;
        const m = rotation(turned);
        const corners = turnedCube(n, m);
        const cut = cutCube(n, corners, h);
        const shape = cube(n);
        const at = (p: number[]): Vec4 => [p[0]!, p[1]!, p[2]!, n === 4 ? h : 0];

        // The shape faint, the cut plane on the cube's rung, the slice bright.
        const segments = shape.edges.map(([a, b]) => ({ from: corners[a]!, to: corners[b]!, alpha: DIM_EDGE }));
        const faces = shape.faces.map((face) => ({ corners: face.map((i) => corners[i]!), alpha: FACE_ALPHA }));
        if (n === 3) {
          const r = CUT_REACH;
          const plane: Vec4[] = [[-r, -r, 0, 0], [r, -r, 0, 0], [r, r, 0, 0], [-r, r, 0, 0]];
          segments.push(...plane.map((p, k) => ({ from: p, to: plane[(k + 1) % 4]!, alpha: CUT_ALPHA })));
          faces.push({ corners: plane, alpha: CUT_FILL });
        }
        segments.push(...cut.edges.map(([a, b]) => ({ from: at(cut.points[a]!), to: at(cut.points[b]!), alpha: EDGE_ALPHA })));
        faces.push(...cut.faces.map((face) => ({ corners: face.map((i) => at(cut.points[i]!)), alpha: SLICE_FILL })));
        view.draw(segments, faces);
        sliceView.draw(cut, n === 4 ? h : 0);
        fill(n, m, cut);
      });
    };

    // The numbers view: the angles, the matrix with its cut row bright, that row as a
    // formula, and what the slice is.
    const fill = (n: number, m: number[], cut: Slice) => {
      const { panel, buttons, sliders, ask } = STEPS[step]!;
      const axis = n === 4 ? "w" : "z";
      const line = (text: string, className = "line") => numbers.appendChild(span(text, className));
      numbers.replaceChildren();
      const shown = [...new Set([...(buttons ?? []), ...(sliders ?? []), ...(Object.keys(turned) as Plane[]).filter((p) => turned[p])])];
      const planes = PLANES.filter((p) => shown.includes(p));
      if (planes.length) line(planes.map((p) => `${p} = ${angleName(turned[p])}`).join(", "));
      const rows = [...Array(n).keys()].map((r) => [...Array(n).keys()].map((c) => num(m[r * 4 + c]!)));
      numbers.append(bracket(rows, (r) => r !== n - 1));
      line(rowFormula(cutRow(m, n)));
      numbers.appendChild(span(`a turned corner's ${axis}, from where it started; the cut keeps ${axis}′ = ${num(h)}`, "note"));
      const name = sliceName(cut, n);
      const size = boxSize(cut).map(num).join(" × ");
      if (n === 3) line(`slice: ${name === "four-sided" ? `rectangle ${size}` : name}`);
      else line(`slice: ${name.startsWith("box") ? `box ${size}` : name}`);
      if (panel === "round" && !revealed) line(`${ask}: ?`);
      if (panel === "sandbox") numbers.appendChild(span("xy, xz and yz alone only turn the slice", "note"));
    };

    // Turn buttons, π/8 a press, and one back to the step's start.
    const addButtons = (planes: Plane[], hold: Plane | undefined, done: () => void) => {
      const row = Object.assign(document.createElement("div"), { className: "choices", role: "group", ariaLabel: "Turns" });
      for (const plane of planes) {
        const button = Object.assign(document.createElement("button"), { type: "button", textContent: `Turn ${plane} by π/8` });
        button.addEventListener("click", () => {
          // Counted in presses, so the angle stays an exact multiple of π/8.
          const presses = (Math.round(turned[plane] / STEP) + 1) % Math.round(FULL / STEP);
          turned = { ...turned, [plane]: presses * STEP };
          if (plane === hold && turned[plane] >= QUARTER - 1e-9) done();
          schedule();
        });
        row.append(button);
      }
      const reset = Object.assign(document.createElement("button"), { type: "button", textContent: "Back to start" });
      reset.addEventListener("click", () => ((turned = angles(STEPS[step]!.start)), schedule()));
      row.append(reset);
      controls.append(row);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(sliceCanvas);
    resize.observe(cutCanvas);

    return {
      show(i, done) {
        step = i;
        h = 0;
        revealed = false;
        const { start, buttons, sliders, hold } = STEPS[i]!;
        turned = angles(start);
        if (buttons) addButtons(buttons, hold, done);
        for (const plane of sliders ?? [])
          addSlider(
            controls,
            plane,
            0,
            FULL,
            0,
            (x) => ((turned = { ...turned, [plane]: snapAngle(x) }), schedule()),
            (x) => angleName(snapAngle(x)),
          );
        if (i === SANDBOX) {
          const stops = () => levels(turnedCube(4, rotation(turned)), 4);
          addSlider(
            controls,
            "h",
            -2,
            2,
            0,
            (x) => ((h = snapCut(x, stops())), schedule()),
            (x) => num(snapCut(x, stops())),
          );
        }
        schedule();
      },
      reveal(i) {
        const after = STEPS[i]!.reveal;
        if (!after) return;
        turned = angles(after);
        revealed = true;
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
