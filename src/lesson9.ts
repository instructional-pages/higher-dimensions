// Lesson 9, "Slicing": the other way to see a shape one dimension up is to cut it with
// something flat one dimension down and look only at the cut. The ladder cuts a segment
// by a point, a square by a line, a cube by a plane (straight on, then corner-first:
// triangle, hexagon, triangle) and the tesseract by w = h (straight on, then
// corner-first: tetrahedron, octahedron, tetrahedron). Corner-first is a lead turn that
// points a corner along the cut's axis; the cut itself never tilts. The Cut view shows
// the shape faint with the slice bright inside it (the tesseract as its shadow); the
// Slice view, here for the first time, shows the slice alone, as the viewer one
// dimension down sees it. The sandbox has presets, the cut and xy, xz, yz.

import type { Lesson } from "./lesson.ts";
import { AXES, multiply, rotation, type Plane, type Vec4 } from "./math4d.ts";
import { createLineView, createSliceView, css, tint } from "./render.ts";
import { cube } from "./shadow.ts";
import { cutCube, leadTurn, levels, sliceName, snapCut, turnedCube } from "./cut.ts";
import { angleName, snapAngle } from "./turn.ts";
import { addSlider, num, span } from "./ui.ts";

// What the numbers view shows on a step.
type Panel = "cut" | "check" | "sandbox";

// Each step's rung (the shape's dimension), how it meets the cut (the dimension of the
// piece that leads: n − 1 straight on, 0 corner-first), the cut slider's range (none on
// a check) and where it starts.
const STEPS: { rung: number; lead: number; panel: Panel; range?: [number, number]; start: number }[] = [
  { rung: 1, lead: 0, panel: "cut", range: [-1.5, 1.5], start: -1.25 },
  { rung: 2, lead: 1, panel: "cut", range: [-1.5, 1.5], start: -0.5 },
  { rung: 3, lead: 2, panel: "cut", range: [-1.5, 1.5], start: -0.5 },
  { rung: 3, lead: 0, panel: "cut", range: [-1.9, -1 / Math.sqrt(3)], start: -1.5 },
  { rung: 3, lead: 0, panel: "check", start: -1 / Math.sqrt(3) },
  { rung: 3, lead: 0, panel: "cut", range: [-1.9, 1.9], start: 0 },
  { rung: 4, lead: 3, panel: "cut", range: [-1.5, 1.5], start: -0.5 },
  { rung: 4, lead: 0, panel: "cut", range: [-2.2, -1], start: -1.6 },
  { rung: 4, lead: 0, panel: "check", start: -1 },
  { rung: 4, lead: 0, panel: "cut", range: [-2.2, 2.2], start: 0 },
  { rung: 4, lead: 0, panel: "sandbox", range: [-2.2, 2.2], start: 0 },
];
const SANDBOX = STEPS.length - 1;
const PRESETS: [string, number][] = [
  ["straight on", 3],
  ["edge-first", 1],
  ["corner-first", 0],
];
// The turns that keep w, so on the tesseract they only turn the slice.
const TURNS: Plane[] = ["xy", "xz", "yz"];

const EDGE_ALPHA = 0.95;
const DIM_EDGE = 0.35;
const FACE_ALPHA = 0.03;
const SLICE_FILL = 0.3;
const CUT_ALPHA = 0.2;
const CUT_FILL = 0.02;
// The line or plane of the cut reaches this far out from the axis.
const CUT_REACH = 2.2;
// Where the cut's label sits along its line or plane's edge.
const LABEL_AT = 2.5;

// A corner's height along the cut's axis once the lead turn is done, from its unturned
// coordinates: "w" straight on, "(x + y + z + w) / 2" corner-first.
function heightFormula(n: number, lead: number): string {
  const terms = [...AXES.slice(0, n - 1 - lead), AXES[n - 1]];
  if (terms.length === 1) return terms[0]!;
  const over = terms.length === 4 ? "2" : `√${terms.length}`;
  return `(${terms.join(" + ")}) / ${over}`;
}

export const lesson9: Lesson = {
  title: "Slicing",
  views: [
    { caption: "Cut", label: "A shape cut by a point, line, plane or 3D space one dimension down, the slice filled inside it; the tesseract as its shadow" },
    { caption: "Slice", label: "The slice on its own, as the viewer one dimension down sees it" },
    { caption: "Numbers" },
  ],
  steps: [
    {
      text: `<p>Lesson 7 saw a shape from one dimension down through its shadow. Here is the
        other way: cut it with something flat, one dimension down, and keep only the cut.</p>
        <p>Start in 1D. A segment runs along x from −1 to 1, and the cut is a single point,
        x = h. Drag h: inside the segment the slice is a point; past an end, nothing.</p>`,
    },
    {
      text: `<p>One rung up, a square is cut by the line y = h. The slice is a segment, the
        same length 2 wherever the line crosses, and nothing past the top or bottom.</p>
        <p>The Slice view beside it shows the slice alone: all that a creature living on
        that line ever sees of the square.</p>`,
    },
    {
      text: `<p>A cube is cut by the plane z = h, straight on. The slice is a square, 2 by 2,
        that appears, stays the same, and disappears.</p><p>A Flatlander living in that
        plane, as the cube passes through, sees only this: a square that pops into being
        and later vanishes. They never see the cube itself.</p>`,
    },
    {
      text: `<p>Now turn the cube first, so a corner points along z: corner-first. The cut
        doesn't tilt; the cube does. A corner's height is now (x + y + z) / √3, so its
        eight corners sit at four levels.</p><p>Drag h up from the bottom corner. A point
        becomes a triangle, which grows until the cut reaches the next three corners.</p>`,
    },
    {
      text: `<p>Keep going to the middle, z = 0. What shape is the slice there?</p>`,
      check: {
        prompts: [{ label: "Middle slice", choices: ["triangle", "square", "hexagon"], answer: "hexagon" }],
        after: `A hexagon. Each face the plane crosses gives the slice one side. Near the
          corner it crosses only the 3 faces that meet there: a triangle. Past the next
          three corners it crosses all 6 faces, so six sides, and at the middle all six are
          the same length, √2.`,
      },
    },
    {
      text: `<p>Here it is. Drag h through the whole cube: a point, a growing triangle, its
        corners clipped into a hexagon, regular at the middle, then back to a triangle
        and a point at the top corner.</p><p>The top triangle points the other way from
        the bottom one: its corners are the bottom one's, each sign flipped.</p>`,
    },
    {
      text: `<p>Now the tesseract, cut by w = h: one 3D space at a single value of w. Our
        whole space is the cut, so there is no plane to draw. The Cut view shows lesson
        7's shadow with the slice inside it, and the Slice view shows the slice alone,
        tinted by its w.</p><p>Straight on, the slice is a cube that appears at w = −1,
        stays the same, and vanishes past w = 1. Now we are the Flatlanders.</p>`,
    },
    {
      text: `<p>Corner-first: the tesseract is turned so a corner points along w. A corner's
        w is now (x + y + z + w) / 2, so its sixteen corners sit at five levels, −2 to 2.</p>
        <p>Drag h up from the bottom corner. A point grows into a tetrahedron: the 4 cubes
        that meet at that corner each give the slice one triangle face.</p>`,
    },
    {
      text: `<p>Keep going to the middle, w = 0. What is the slice there?</p>`,
      check: {
        prompts: [{ label: "Middle slice", choices: ["tetrahedron", "cube", "octahedron"], answer: "octahedron" }],
        after: `An octahedron, the hexagon's 4D cousin. Each cube the cut crosses gives the
          slice one face. Near the corner it crosses only the 4 cubes that meet there; at
          the middle it crosses all 8, each in a triangle: 8 triangles make an octahedron.`,
      },
    },
    {
      text: `<p>Here it is. Between, the tetrahedron's corners are clipped, leaving 4
        hexagons and 4 triangles, like the cube's clipped triangle one rung down. At the
        middle the clipped corners meet and every face is a triangle.</p><p>Past it, the
        slice shrinks back to a tetrahedron pointing the other way, and a point.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> Pick how the tesseract meets the cut, straight on,
        edge-first or corner-first, then move h.</p><p>xy, xz and yz turn it after that.
        They don't change w, so they only turn the slice; its shape stays. What does
        edge-first give?</p>`,
    },
  ],
  start(figures, controls) {
    const [cutFigure, sliceFigure, numbersFigure] = figures as [HTMLElement, HTMLElement, HTMLElement];
    const cutCanvas = cutFigure.querySelector("canvas")!;
    const sliceCanvas = sliceFigure.querySelector("canvas")!;
    const view = createLineView(cutCanvas);
    const sliceView = createSliceView(sliceCanvas);
    if (!view || !sliceView) return null;

    const cutMarks = cutFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const sliceMarks = sliceFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const numbers = numbersFigure.appendChild(Object.assign(document.createElement("div"), { className: "numbers" }));

    let step = 0;
    let h = 0;
    // The sandbox's preset lead and its turns in xy, xz, yz.
    let lead = 0;
    const angles = { xy: 0, xz: 0, yz: 0, xw: 0, yw: 0, zw: 0 };

    const mark = (parent: HTMLElement, text: string, className: string, [left, top]: [number, number]) => {
      const el = parent.appendChild(span(text, className));
      el.style.setProperty("--tint", css(tint(0)));
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { rung: n, panel } = STEPS[step]!;
        const turn = panel === "sandbox" ? multiply(rotation(angles), leadTurn(4, lead)) : leadTurn(n, STEPS[step]!.lead);
        const corners = turnedCube(n, turn);
        const cut = cutCube(n, corners, h);
        const shape = cube(n);
        const axis = n - 1;
        const at = (p: number[]): Vec4 => (n === 4 ? [p[0]!, p[1]!, p[2]!, h] : [p[0]!, p[1]!, p[2]!, 0]);

        // The shape faint, the cut's line or plane on the lower rungs, the slice bright.
        const segments = shape.edges.map(([a, b]) => ({ from: corners[a]!, to: corners[b]!, alpha: DIM_EDGE }));
        const faces = shape.faces.map((face) => ({ corners: face.map((i) => corners[i]!), alpha: FACE_ALPHA }));
        const onCut = (u: number, v: number): Vec4 => (n === 2 ? [u, h, 0, 0] : [u, v, h, 0]);
        if (n === 2) segments.push({ from: onCut(-CUT_REACH, 0), to: onCut(CUT_REACH, 0), alpha: CUT_ALPHA });
        if (n === 3) {
          const plane = [onCut(-CUT_REACH, -CUT_REACH), onCut(CUT_REACH, -CUT_REACH), onCut(CUT_REACH, CUT_REACH), onCut(-CUT_REACH, CUT_REACH)];
          segments.push(...plane.map((p, k) => ({ from: p, to: plane[(k + 1) % 4]!, alpha: CUT_ALPHA })));
          faces.push({ corners: plane, alpha: CUT_FILL });
        }
        segments.push(...cut.edges.map(([a, b]) => ({ from: at(cut.points[a]!), to: at(cut.points[b]!), alpha: EDGE_ALPHA })));
        faces.push(...cut.faces.map((face) => ({ corners: face.map((i) => at(cut.points[i]!)), alpha: SLICE_FILL })));
        view.draw(segments, faces);
        sliceView.draw(cut, n === 4 ? h : 0);

        cutMarks.replaceChildren();
        sliceMarks.replaceChildren();
        const name = `${AXES[axis]} = ${num(h)}`;
        if (n === 1) mark(cutMarks, name, cut.points.length ? "corner new" : "corner", view.screen([h, 0, 0, 0]));
        if (n === 2) mark(cutMarks, name, "label", view.screen(onCut(LABEL_AT, 0)));
        if (n === 3) mark(cutMarks, name, "label", view.screen(onCut(LABEL_AT, -CUT_REACH)));
        if (cut.points.length === 1) mark(sliceMarks, "", "corner new", sliceView.screen(cut.points[0]!));
        fill(corners, cut);
      });
    };

    // The numbers view: the cut, the slice's name, and on turned steps how a corner's
    // height follows from its coordinates and the levels the corners sit at.
    const fill = (corners: Vec4[], cut: ReturnType<typeof cutCube>) => {
      const { rung: n, panel } = STEPS[step]!;
      const stepLead = panel === "sandbox" ? lead : STEPS[step]!.lead;
      const axis = AXES[n - 1];
      const line = (text: string, className = "line") => numbers.appendChild(span(text, className));
      numbers.replaceChildren();
      if (panel === "sandbox") {
        line(`${PRESETS.find(([, l]) => l === lead)![0]}; ${TURNS.map((p) => `${p} = ${angleName(angles[p])}`).join(", ")}`);
      }
      if (stepLead < n - 1) {
        line(`height = ${heightFormula(n, stepLead)}`);
        line(`corner levels: ${levels(corners, n).map(num).join(", ")}`);
      }
      if (panel === "check") {
        line(`${axis} = ${num(h)}: ${sliceName(cut, n)}`);
        line(`${axis} = 0: ?`);
        return;
      }
      line(`${axis} = ${num(h)}`);
      line(`slice: ${sliceName(cut, n)}`);
      if (n === 2 && cut.points.length === 2) line(`length ${num(Math.hypot(cut.points[0]![0] - cut.points[1]![0], cut.points[0]![1] - cut.points[1]![1]))}`);
      if (n === 4 && cut.faces.length) line(`${cut.points.length} corners, ${cut.edges.length} edges, ${cut.faces.length} faces`);
      if (n === 3 && cut.faces.length) numbers.appendChild(span("each face the plane crosses gives one side", "note"));
      if (n === 4 && cut.faces.length) numbers.appendChild(span("each cube the cut crosses gives one face", "note"));
      if (panel === "sandbox") numbers.appendChild(span("xy, xz and yz don't change w: they only turn the slice", "note"));
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(cutCanvas);
    resize.observe(sliceCanvas);

    return {
      show(i) {
        step = i;
        const { rung: n, range, start } = STEPS[i]!;
        h = start;
        lead = 0;
        for (const p of TURNS) angles[p] = 0;
        const stops = () => levels(turnedCube(n, i === SANDBOX ? leadTurn(4, lead) : leadTurn(n, STEPS[i]!.lead)), n);
        if (range)
          addSlider(
            controls,
            "h",
            range[0],
            range[1],
            h,
            (x) => ((h = snapCut(x, stops())), schedule()),
            (x) => num(snapCut(x, stops())),
          );
        if (i === SANDBOX) {
          const row = Object.assign(document.createElement("div"), { className: "choices", role: "group", ariaLabel: "How it meets the cut" });
          const buttons = PRESETS.map(([label, l]) => {
            const button = Object.assign(document.createElement("button"), { type: "button", textContent: label });
            button.ariaPressed = String(l === lead);
            button.addEventListener("click", () => {
              lead = l;
              for (const b of buttons) b.ariaPressed = String(b === button);
              schedule();
            });
            return button;
          });
          row.append(...buttons);
          controls.prepend(row);
          for (const plane of TURNS)
            addSlider(
              controls,
              plane,
              0,
              2 * Math.PI,
              0,
              (x) => ((angles[plane] = snapAngle(x)), schedule()),
              (x) => angleName(snapAngle(x)),
            );
        }
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
