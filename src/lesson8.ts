// Lesson 8, "Turning into w": the new motion. Turning in a plane that contains the
// direction a viewer looks along swaps a side they see face-on with one that points at
// them, so in the perspective shadow the shape seems to turn inside out. The ladder turns
// a square in xy seen as its 1D shadow, a cube in xz seen as its 2D shadow, and the
// tesseract in xw seen as its 3D shadow, each with its x = +1 piece bright; then the 4×4
// matrix with the 2×2 block in x and w, two checks (π/2 and 2π), yw and zw, and a sandbox
// with all six planes. The shapes are centred, corners at ±1, as in lesson 7.

import type { Lesson } from "./lesson.ts";
import { apply, PLANES, rotation, type Plane, type Vec4 } from "./math4d.ts";
import { inBlock } from "./planes.ts";
import { createLineView, css, tint, W_DISTANCE } from "./render.ts";
import { cast, cube, extent, inPiece, nearest, pieceName } from "./shadow.ts";
import { angleName, snapAngle } from "./turn.ts";
import { addSlider, bracket, num, span } from "./ui.ts";

// What the numbers view shows on a step.
type Panel = "square" | "cube" | "tesseract" | "matrix" | "check" | "quarter" | "full" | "three" | "sandbox";

// The planes that turn into w.
const W_TURNS: Plane[] = ["xw", "yw", "zw"];

// Each step's rung (the shape's dimension), the planes it has sliders for (the others go
// back to 0), and whether the x = +1 piece is bright.
const STEPS: { rung: number; panel: Panel; planes: Plane[]; lit: boolean }[] = [
  { rung: 2, panel: "square", planes: ["xy"], lit: true },
  { rung: 3, panel: "cube", planes: ["xz"], lit: true },
  { rung: 4, panel: "tesseract", planes: ["xw"], lit: true },
  { rung: 4, panel: "matrix", planes: ["xw"], lit: true },
  { rung: 4, panel: "check", planes: [], lit: true },
  { rung: 4, panel: "quarter", planes: ["xw"], lit: true },
  { rung: 4, panel: "full", planes: [], lit: true },
  { rung: 4, panel: "three", planes: W_TURNS, lit: false },
  { rung: 4, panel: "sandbox", planes: [...PLANES], lit: false },
];
// The steps whose toggle hides the shape, leaving what the viewer one dimension down sees.
const TOGGLES = [0, 1];
// Next waits until xw has reached π/2 here.
const HOLD = 2;
// This step starts at xw = π/2, the first check's answer.
const QUARTER = 5;
const ZERO = { xy: 0, xz: 0, yz: 0, xw: 0, yw: 0, zw: 0 };
// The piece that starts facing +x.
const LIT = 1;
const PIECES = ["", "", "side", "face", "cube"];

// On the lower rungs, as in lesson 7: the screen at −1.5 along the direction the viewer
// looks along, the viewer at W_DISTANCE, the same distance as the tesseract's along w.
const SCREEN = -1.5;
const VIEWER = W_DISTANCE;
const SCREEN_REACH = 2.4;
const EDGE_ALPHA = 0.95;
const DIM_EDGE = 0.35;
const FACE_ALPHA = 0.05;
const LIT_FILL = 0.12;
const SHADOW_ALPHA = 0.6;
const DIM_SHADOW = 0.2;
const SHADOW_FILL = 0.04;
const SCREEN_ALPHA = 0.2;
const SCREEN_FILL = 0.02;
const RAY_ALPHA = 0.12;

const TESSERACT = cube(4);
const CENTRE: Vec4 = [1, 0, 0, 0];
// The x = +1 label sits this far out from the centre, just beyond its piece.
const LABEL_OUT = 1.3;

const rows4 = (m: number[]) => [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => num(m[r * 4 + c]!)));
const column = (v: Vec4) => bracket(v.map((x) => [num(x)]));

export const lesson8: Lesson = {
  title: "Turning into w",
  views: [{ caption: "Shadow", label: "Shapes turning toward a viewer one dimension up, seen as their perspective shadows, up to the tesseract turning in xw" }, { caption: "Numbers" }],
  steps: [
    {
      text: `<p>Lesson 7 saw shapes through their shadows. Now turn a shape <em>toward</em>
        the viewer, in a plane that contains the direction they look along.</p><p>A square
        turns in xy, seen by a viewer at y = 3 only as its shadow on a line. Its x = +1 side
        is bright. Drag xy: that side swings toward the viewer, its shadow grows, and by π/2
        it is the near side, casting the whole shadow. Try Shadow only to see just what the
        1D viewer sees.</p>`,
    },
    {
      text: `<p>One rung up, a cube turns in xz, seen by a viewer at z = 3 as its shadow on a
        flat screen: a square in a square, the near face outside, the far face inside.</p>
        <p>Drag xz. The bright x = +1 face starts as the strip on the right, joining inner
        square to outer. It swings toward the viewer and spreads until, at π/2, it is the
        outer square, while the old outer square slides off to the left. A 2D viewer sees
        the inside of a square turn out.</p>`,
    },
    {
      text: `<p>Now the tesseract, turning in xw, a plane that contains w. Its shadow along w
        is lesson 7's cube in a cube: the near cube (w = 1) warm outside, the far one
        (w = −1) cool inside.</p><p>Drag xw to π/2. The bright x = +1 cube starts as the box
        on the right, joining inner to outer. It grows and warms as it trades x for w, and
        ends as the outer cube. The tesseract only turns, but a turn toward the viewer looks
        like the shape turning inside out.</p>`,
      hold: true,
    },
    {
      text: `<p>The matrix is lesson 5's 2×2 block again, now in the x and w rows and columns;
        y and z get the identity's 1s and never change.</p><p class="formula">x′ = cos θ · x
        − sin θ · w<br>w′ = sin θ · x + cos θ · w</p><p>x turns toward w: what a corner loses
        in x it gains in w, and its tint warms. Drag xw and watch only the bright entries
        move.</p>`,
    },
    {
      text: `<p>Turn xw by π/2, where cos θ = 0 and sin θ = 1. Which cube ends up on the
        outside?</p>`,
      check: {
        prompts: [{ label: "Outside", choices: ["x = +1", "x = −1", "w = +1, it stays"], answer: "x = +1" }],
        after: `The x = +1 cube, the one that faced +x. At π/2, w′ = x: its corners, all with
          x = 1, now have w = 1, nearest the viewer, so they cast the outer cube. The old
          outer cube, w = 1, has x′ = −w = −1: it is now the box on the left.`,
      },
    },
    {
      text: `<p>Here it is at π/2. The matrix sends (1, 0, 0, 0), the centre of the x = +1
        cube, to (0, 0, 0, 1): straight at the viewer.</p><p>Keep going. At π the outer and
        inner cubes have traded places, and at 3π/2 the x = −1 cube is outside.</p>`,
    },
    {
      text: `<p>Keep turning to 2π, a full turn. Where is everything?</p>`,
      check: {
        prompts: [{ label: "After 2π", choices: ["back where it started", "turned inside out", "mirrored in x"], answer: "back where it started" }],
        after: `Back where it started: cos 2π = 1 and sin 2π = 0, so the matrix is the
          identity. In one full turn the x = +1, w = −1, x = −1 and w = +1 cubes each take
          their turn outside, and then every corner is home.`,
      },
    },
    {
      text: `<p>w can turn with any of the three directions we see, so there are two more
        planes, yw and zw, each the same block in its own rows and columns.</p><p>Drag them
        one at a time: each brings a different cube outside, y = +1 or z = +1. With xy, xz
        and yz, these are 4D's six planes.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> All six planes and the live 4×4 matrix, combined in
        the panel's order.</p><p>The first three turn the shadow as a 3D object turns; the
        last three turn the tesseract into w and out again. Try xw and yw together.</p>`,
    },
  ],
  start(figures, controls) {
    const [shadowFigure, numbersFigure] = figures as [HTMLElement, HTMLElement];
    const canvas = shadowFigure.querySelector("canvas")!;
    const view = createLineView(canvas);
    if (!view) return null;

    const marks = shadowFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));
    const numbers = numbersFigure.appendChild(Object.assign(document.createElement("div"), { className: "numbers" }));

    let step = 0;
    const angles = { ...ZERO };
    // On the toggle steps, whether only the shadow is drawn.
    let shadowOnly = false;

    const mark = (text: string, className: string, v: Vec4) => {
      const el = marks.appendChild(span(text, className));
      el.style.setProperty("--tint", css(tint(v[3])));
      const [left, top] = view.screen(v);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    // The numbers view for the current step; `shadows` are the shape's corners' shadows.
    const fill = (m: number[], shadows: Vec4[]) => {
      const { rung, panel } = STEPS[step]!;
      const line = (text: string, className = "line") => numbers.appendChild(span(text, className));
      const angle = (plane: Plane) => line(`${plane} = ${angleName(angles[plane])}`);
      const outside = () => line(`outside: ${nearest(m, rung, rung - 1).map(pieceName).join(" and ")}`);
      const planeMatrix = (plane: Plane) => bracket(rows4(rotation({ ...ZERO, [plane]: angles[plane] })), (r, c) => !inBlock(plane, r, c));
      const lit = shadows.filter((_, i) => inPiece(LIT, i));
      numbers.replaceChildren();
      if (panel === "square" || panel === "cube") {
        angle(panel === "square" ? "xy" : "xz");
        const size = panel === "square" ? num(extent(lit.map((v) => v[0]))) : `${num(extent(lit.map((v) => v[0])))} × ${num(extent(lit.map((v) => v[1])))}`;
        line(`x = +1 ${PIECES[rung]}'s shadow: ${size}`);
        outside();
        numbers.appendChild(span(`the ${PIECES[rung]} nearest the viewer casts the outside`, "note"));
      }
      if (panel === "tesseract") {
        angle("xw");
        outside();
        numbers.appendChild(span("each corner's tint follows its w", "note"));
      }
      if (panel === "matrix") {
        angle("xw");
        numbers.append(planeMatrix("xw"));
        numbers.appendChild(span("rows and columns x, y, z, w", "note"));
      }
      if (panel === "check") {
        line("xw = 0: outside, w = +1");
        line("xw = π/2: outside, ?");
      }
      if (panel === "quarter") {
        angle("xw");
        const product = numbers.appendChild(Object.assign(document.createElement("div"), { className: "product" }));
        product.append(bracket(rows4(m)), column(CENTRE), span("="), column(apply(m, CENTRE)));
        outside();
      }
      if (panel === "full") {
        line("xw = 2π: ?");
      }
      if (panel === "three") {
        const three = numbers.appendChild(Object.assign(document.createElement("div"), { className: "three" }));
        for (const plane of W_TURNS) three.appendChild(document.createElement("div")).append(span(`${plane} = ${angleName(angles[plane])}`), planeMatrix(plane));
        outside();
      }
      if (panel === "sandbox") {
        line(PLANES.map((p) => `${p} = ${angleName(angles[p])}`).join(", "));
        line(`M = ${[...PLANES].reverse().join(" · ")}`);
        numbers.append(bracket(rows4(m)));
        outside();
      }
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { rung, lit } = STEPS[step]!;
        const m = rotation(angles);
        const bright = (corners: number[]) => lit && corners.every((i) => inPiece(LIT, i));
        marks.replaceChildren();
        if (rung === 4) {
          const turned = TESSERACT.vertices.map((v) => apply(m, v));
          view.draw(
            TESSERACT.edges.map(([a, b]) => ({ from: turned[a]!, to: turned[b]!, alpha: !lit || bright([a, b]) ? EDGE_ALPHA : DIM_EDGE })),
            TESSERACT.faces.map((face) => ({ corners: face.map((i) => turned[i]!), alpha: bright(face) ? LIT_FILL : FACE_ALPHA })),
          );
          if (lit) mark("x = +1", "label", apply(m, CENTRE).map((x) => x * LABEL_OUT) as Vec4);
          fill(m, turned);
          return;
        }

        // The lower rungs: the shape and the rays unless only the shadow is shown, the
        // screen, and the shadow on it, the x = +1 piece bright.
        const shape = cube(rung);
        const axis = rung - 1;
        const turned = shape.vertices.map((v) => apply(m, v));
        const shadows = turned.map((v) => cast(v, axis, SCREEN, VIEWER));
        const eye: Vec4 = [0, 0, 0, 0];
        eye[axis] = VIEWER;
        // The screen's corners, in order around it; on rung 2 its two ends.
        const screen = cube(rung - 1).vertices.map((v) => {
          const p = v.map((x) => x * SCREEN_REACH) as Vec4;
          p[axis] = SCREEN;
          return p;
        });
        if (screen.length === 4) [screen[2], screen[3]] = [screen[3]!, screen[2]!];
        const segments = [
          ...(screen.length > 1 ? screen.map((p, k) => ({ from: p, to: screen[(k + 1) % screen.length]!, alpha: SCREEN_ALPHA })) : []),
          ...shape.edges.map(([a, b]) => ({ from: shadows[a]!, to: shadows[b]!, alpha: bright([a, b]) ? SHADOW_ALPHA : DIM_SHADOW })),
        ];
        const faces = [
          ...(screen.length === 4 ? [{ corners: screen, alpha: SCREEN_FILL }] : []),
          ...shape.faces.map((face) => ({ corners: face.map((i) => shadows[i]!), alpha: bright(face) ? LIT_FILL : SHADOW_FILL })),
        ];
        if (!shadowOnly) {
          segments.push(
            ...shadows.map((to) => ({ from: eye, to, alpha: RAY_ALPHA })),
            ...shape.edges.map(([a, b]) => ({ from: turned[a]!, to: turned[b]!, alpha: bright([a, b]) ? EDGE_ALPHA : DIM_EDGE })),
          );
          faces.push(...shape.faces.map((face) => ({ corners: face.map((i) => turned[i]!), alpha: bright(face) ? LIT_FILL : FACE_ALPHA })));
        }
        view.draw(segments, faces);
        const label = apply(m, CENTRE).map((x) => x * LABEL_OUT) as Vec4;
        mark("x = +1", "label", shadowOnly ? cast(label, axis, SCREEN, VIEWER) : label);
        // On a line the side's shadow lies over the rest: dots mark its ends.
        if (rung === 2) shadows.forEach((v, i) => inPiece(LIT, i) && mark("", "corner", v));
        if (!shadowOnly) mark("viewer", "corner new", eye);
        fill(m, shadows);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return {
      show(i, done) {
        step = i;
        shadowOnly = false;
        const { planes } = STEPS[i]!;
        for (const plane of PLANES) if (!planes.includes(plane)) angles[plane] = 0;
        if (i === QUARTER) angles.xw = Math.PI / 2;
        for (const plane of planes)
          addSlider(
            controls,
            plane,
            0,
            2 * Math.PI,
            angles[plane],
            (x) => {
              angles[plane] = snapAngle(x);
              if (i === HOLD && angles.xw >= Math.PI / 2 - 1e-9) done();
              schedule();
            },
            (x) => angleName(snapAngle(x)),
          );
        if (TOGGLES.includes(i)) {
          const button = Object.assign(document.createElement("button"), { type: "button", textContent: "Shadow only" });
          button.addEventListener("click", () => {
            shadowOnly = !shadowOnly;
            button.textContent = shadowOnly ? "Show the shape" : "Shadow only";
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
