// Lesson 12, "Everything linked": the shadow, the slice and the net are three views of
// one object, and one turn drives them all. The ladder shows all three, with the
// matrix and a corner's coordinates in Numbers, for the square, the cube and the
// tesseract, each with its own planes, the cut and the fold. Then a mixed final round:
// predict a slice under xw, and count the 5D and 6D cubes' pieces with no picture. The
// sandbox is the whole tesseract.

import { closedForm } from "./count.ts";
import { cutCube, levels, snapCut, turnedCube } from "./cut.ts";
import type { Lesson } from "./lesson.ts";
import { describe, netTurn, rungPlanes, SCREEN, shadowOf } from "./linked.ts";
import { AXES, PLANES, rotation, type Angles, type Vec4 } from "./math4d.ts";
import { net } from "./net.ts";
import { createLineView, createNetView, createSliceView, css, NET_FRAMES, tint } from "./render.ts";
import { cube } from "./shadow.ts";
import type { Slice } from "./slice.ts";
import { thumbnail } from "./thumb.ts";
import { angleName, snapAngle } from "./turn.ts";
import { angles, cutRow, rowFormula, STEP, turningSlice } from "./turning.ts";
import { addSlider, bracket, coords, num, span } from "./ui.ts";

// What a step does: turn the rung's shape with sliders, ask for the next slice, or ask
// for counts with the rung `known` shown as a start.
type Panel = "turn" | "round" | "counts";

const STEPS: { rung: number; panel: Panel; start?: Partial<Angles>; ask?: string; reveal?: Partial<Angles>; known?: number }[] = [
  { rung: 2, panel: "turn" },
  { rung: 3, panel: "turn" },
  { rung: 4, panel: "turn" },
  { rung: 4, panel: "turn" },
  { rung: 4, panel: "turn" },
  { rung: 4, panel: "round", start: { zw: 2 * STEP }, ask: "xw = π/4 as well", reveal: { zw: 2 * STEP, xw: 2 * STEP } },
  { rung: 4, panel: "counts", known: 4 },
  { rung: 4, panel: "counts", known: 5 },
  { rung: 4, panel: "turn" },
];
const FULL = 2 * Math.PI;
// Turned corners reach √n along the last axis, at most 2, so the cut sweeps every rung.
const CUT_RANGE = 2;

const EDGE_ALPHA = 0.95;
const FACE_ALPHA = 0.03;
const SLICE_FILL = 0.3;
// The slice marked inside the tesseract's shadow, as in the sandbox.
const SLICE_MARK = 0.14;
const SHADOW_ALPHA = 0.6;
const SHADOW_FILL = 0.06;
const SCREEN_ALPHA = 0.2;
const SCREEN_FILL = 0.02;
// How far the screen reaches either side of its centre: turned shadows reach √3.
const SCREEN_REACH = 2.4;

// What the views show, for screen readers.
const NAMES: Record<number, string> = { 2: "square", 3: "cube", 4: "tesseract" };
const PIECES = ["corners", "edges", "squares", "cubes", "4D cells"];

// The final round's pictures, all at w = 0.
const picture = (some: Partial<Angles>, title: string) => thumbnail(turningSlice(4, some), 0, title);

export const lesson12: Lesson = {
  title: "Everything linked",
  views: [
    { caption: "Shadow", label: "The shape's shadow one dimension down, with its slice marked" },
    { caption: "Slice", label: "The shape's slice, as the viewer one dimension down sees it" },
    { caption: "Net", label: "The shape's boundary laid flat one dimension down, folding back up" },
    { caption: "Numbers" },
  ],
  steps: [
    {
      text: `<p>Three ways to see a shape from one dimension down: its <em>shadow</em>
        (lesson 7), a <em>slice</em> (9) and its <em>net</em> (11). They are views of one
        object, so they move together.</p><p>The square: turn xy, move the cut h, fold the
        net. The shadow and the slice follow xy. The net only folds: flat, it lies in the
        line y = 1, and xy would turn it out of that line.</p><p>Numbers: the matrix, its
        bottom row as a formula (a turned corner's y), and corner A, marked in the
        shadow.</p>`,
    },
    {
      text: `<p>One rung up. On its own, xy keeps z: it turns all three views, and the
        slice turns but keeps its shape.</p><p>xz and yz turn into z, the last axis. The
        shadow and the slice change shape, as in lesson 10, but the net stays put: flat, it
        lies in the plane z = 1, and they would turn it out of that plane. Once they are
        turned, xy changes the slice too: it turns the cube first, so it changes which way
        the cut runs across it.</p>`,
    },
    {
      text: `<p>And the tesseract: its shadow along w, its slice where w = h, its net of 8
        cubes, and the 4 × 4 matrix.</p><p>Click a small view to make it the main one,
        Numbers too. Every slider updates all of them at once.</p>`,
    },
    {
      text: `<p>What each control moves. xy, xz and yz keep w. On their own they turn all
        three views, and the slice keeps its shape; once a turn into w is set, they change
        the slice too, since they turn first.</p>`,
    },
    {
      text: `<p>xw, yw and zw turn into w. The shadow's inner and outer cubes trade places,
        the slice changes as the matrix's bottom row says, and the net stays put, since it
        would leave our space.</p><p>h moves only the cut: the slice, and its mark in the
        shadow. fold moves only the net.</p>`,
    },
    {
      text: `<p>A final round to finish. zw is at π/4: the slice is a box, 2.83 long along
        z. Now xw turns to π/4 as well. Which is the slice?</p>`,
      check: {
        prompts: [
          {
            label: "Next slice",
            choices: ["A", "B", "C"],
            answer: "B",
            pictures: [
              picture({ xw: 2 * STEP, yw: 2 * STEP }, "a hexagonal prism running along z"),
              picture({ zw: 2 * STEP, xw: 2 * STEP }, "a hexagonal prism running along y"),
              picture({ zw: 2 * STEP }, "a box 2.83 long along z, as now"),
            ],
          },
        ],
        after: `B. Two planes into w tilt the cut in x and z at once, and across x, z and w it
          cuts a hexagon. Neither touches y: the bottom row reads w′ = 0.5x + 0.71z + 0.5w,
          with no y, so the hexagon runs straight along y. A is what xw and yw would
          give.`,
      },
    },
    {
      text: `<p>No picture now. The 5D cube is the tesseract extruded along a fifth
        direction. How many of each piece does it have? Numbers has the tesseract's counts
        to start from.</p>`,
      check: {
        prompts: PIECES.map((piece, k) => ({ label: piece[0]!.toUpperCase() + piece.slice(1), answer: closedForm(5, k) })),
        after: `32, 80, 80, 40, 10. Each is twice the tesseract's count (the old copy and the
          new) plus its count one size down, swept along the fifth direction: edges
          2·32&nbsp;+&nbsp;16, squares 2·24&nbsp;+&nbsp;32, cubes 2·8&nbsp;+&nbsp;24, 4D cells
          2·1&nbsp;+&nbsp;8. Or straight from lesson 4:
          F(5,&nbsp;k)&nbsp;=&nbsp;C(5,&nbsp;k)·2<sup>5−k</sup>.`,
      },
    },
    {
      text: `<p>One more rung, still with no picture. How many edges does the 6D cube
        have?</p>`,
      check: {
        prompts: [{ label: "Edges", answer: closedForm(6, 1) }],
        after: `192. It has 64 corners, each with 6 edges, one per direction, and every edge
          has 2 ends: 64·6&nbsp;/&nbsp;2. Or from the 5D cube: 2·80&nbsp;+&nbsp;32.`,
      },
    },
    {
      text: `<p><strong>Sandbox.</strong> The whole tesseract: all three views, all six
        turns, the cut and the fold, with the matrix and corner A in Numbers.</p><p>Before
        each move, predict what every view will do.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, sliceFigure, netFigure, numbersFigure] = figures as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    const canvas = (f: HTMLElement) => f.querySelector("canvas")!;
    const [shadowCanvas, sliceCanvas, netCanvas] = [canvas(shadowFigure), canvas(sliceFigure), canvas(netFigure)];
    const shadowView = createLineView(shadowCanvas);
    const sliceView = createSliceView(sliceCanvas);
    const netView = createNetView(netCanvas);
    if (!shadowView || !sliceView || !netView) return null;
    const shadowMarks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const sliceMarks = sliceFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const numbers = numbersFigure.appendChild(Object.assign(document.createElement("div"), { className: "numbers" }));

    let step = 0;
    let turned = angles();
    let h = 0;
    let fold = 0;
    let revealed = false;

    const mark = (box: HTMLElement, text: string, className: string, w: number, [left, top]: [number, number]) => {
      const el = box.appendChild(span(text, className));
      el.style.setProperty("--tint", css(tint(w)));
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const n = STEPS[step]!.rung;
        const m = rotation(turned);
        const shape = cube(n);
        const corners = turnedCube(n, m);
        const cut = cutCube(n, corners, h);
        // The slice's points back in 4D: at w = h on the tesseract, w = 0 below it.
        const at = (p: number[]): Vec4 => [p[0]!, p[1]!, p[2]!, n === 4 ? h : 0];
        const sliceFaces = cut.faces.map((face) => ({ corners: face.map((i) => at(cut.points[i]!)), alpha: n === 4 ? SLICE_MARK : SLICE_FILL }));
        const sliceEdges = n === 4 ? [] : cut.edges.map(([a, b]) => ({ from: at(cut.points[a]!), to: at(cut.points[b]!), alpha: EDGE_ALPHA }));
        const segments = shape.edges.map(([a, b]) => ({ from: corners[a]!, to: corners[b]!, alpha: EDGE_ALPHA }));
        const faces = shape.faces.map((face) => ({ corners: face.map((i) => corners[i]!), alpha: FACE_ALPHA }));
        if (n < 4) {
          // The screen behind the shape along its last axis, and the shadow on it.
          const axis = n - 1;
          const shadows = corners.map((v) => shadowOf(v, n));
          const screen = cube(n - 1).vertices.map((v) => {
            const p = v.map((x) => x * SCREEN_REACH) as Vec4;
            p[axis] = SCREEN;
            return p;
          });
          if (screen.length === 4) [screen[2], screen[3]] = [screen[3]!, screen[2]!];
          segments.push(...screen.map((p, k) => ({ from: p, to: screen[(k + 1) % screen.length]!, alpha: SCREEN_ALPHA })));
          segments.push(...shape.edges.map(([a, b]) => ({ from: shadows[a]!, to: shadows[b]!, alpha: SHADOW_ALPHA })));
          if (screen.length === 4) faces.push({ corners: screen, alpha: SCREEN_FILL });
          faces.push(...shape.faces.map((face) => ({ corners: face.map((i) => shadows[i]!), alpha: SHADOW_FILL })));
        }
        shadowView.draw([...segments, ...sliceEdges], [...faces, ...sliceFaces]);
        sliceView.draw(cut, n === 4 ? h : 0);
        netView.draw(net(fold, n), netTurn(turned, n), [], NET_FRAMES[n]);

        // Corner A, all +1, where it has turned to; a slice that is one point, marked.
        const a = corners[corners.length - 1]!;
        shadowMarks.replaceChildren();
        sliceMarks.replaceChildren();
        mark(shadowMarks, "A", "corner new", a[3], shadowView.screen(a));
        if (cut.points.length === 1) mark(sliceMarks, "", "corner new", 0, sliceView.screen(cut.points[0]!));
        fill(n, m, cut, shape.vertices[shape.vertices.length - 1]!, a);
      });
    };

    // The numbers view: the turns, the matrix with its cut row bright, that row as a
    // formula, the slice, and corner A; on the count steps, the rung to start from.
    const fill = (n: number, m: number[], cut: Slice, start: Vec4, a: Vec4) => {
      const { panel, ask, known } = STEPS[step]!;
      const line = (text: string, className = "line") => numbers.appendChild(span(text, className));
      numbers.replaceChildren();
      if (panel === "counts") {
        line(known === 4 ? "the tesseract" : "the 5D cube");
        PIECES.slice(0, known).forEach((piece, k) => line(`${closedForm(known!, k)} ${piece}`));
        if (known === 4) line("1 4D cell, itself");
        line(known === 4 ? "the 5D cube: ?" : "the 6D cube's edges: ?");
        return;
      }
      const axis = AXES[n - 1]!;
      const planes = PLANES.filter((p) => turned[p]);
      line(planes.length ? planes.map((p) => `${p} = ${angleName(turned[p])}`).join(", ") : "not turned");
      const rows = [...Array(n).keys()].map((r) => [...Array(n).keys()].map((c) => num(m[r * 4 + c]!)));
      numbers.append(bracket(rows, (r) => r !== n - 1));
      line(rowFormula(cutRow(m, n)));
      numbers.appendChild(span(`a turned corner's ${axis}; the slice keeps ${axis}′ = ${num(h)}`, "note"));
      if (panel === "round" && !revealed) line(`${ask}: ?`);
      else line(`slice: ${describe(cut, n)}`);
      line(`A ${coords(start, n)} → ${coords(a, n)}`);
    };

    const resize = new ResizeObserver(schedule);
    for (const c of [shadowCanvas, sliceCanvas, netCanvas]) resize.observe(c);

    return {
      show(i) {
        step = i;
        const { rung, panel, start } = STEPS[i]!;
        turned = angles(start);
        h = 0;
        fold = 0;
        revealed = false;
        for (const c of [shadowCanvas, sliceCanvas, netCanvas]) c.ariaLabel = `${c.ariaLabel?.split(":")[0]}: the ${NAMES[rung]}`;
        if (panel === "turn") {
          for (const plane of rungPlanes(rung))
            addSlider(
              controls,
              plane,
              0,
              FULL,
              0,
              (x) => ((turned = { ...turned, [plane]: snapAngle(x) }), schedule()),
              (x) => angleName(snapAngle(x)),
            );
          const stops = () => levels(turnedCube(rung, rotation(turned)), rung);
          addSlider(
            controls,
            "h",
            -CUT_RANGE,
            CUT_RANGE,
            0,
            (x) => ((h = snapCut(x, stops())), schedule()),
            (x) => num(snapCut(x, stops())),
          );
          addSlider(controls, "fold", 0, 1, 0, (x) => ((fold = x), schedule()), (x) => `${Math.round(x * 100)}%`);
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
