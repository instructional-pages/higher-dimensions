// Lesson 7, "Shadows": to see a shape from one dimension up, look at its shadow one
// dimension down. The ladder casts a segment onto a point, a turning square onto a line
// and a cube onto a screen, straight on or in perspective; then predicts and shows the
// tesseract's perspective shadow along w, a cube inside a cube, works the scale
// d / (d − w), and shows what the shadow distorts. The shapes are centred, corners at ±1,
// so the shadows nest.

import type { Lesson } from "./lesson.ts";
import { AXES, apply, projectW, rotation, type Plane, type Vec4 } from "./math4d.ts";
import { corner } from "./planes.ts";
import { createLineView, css, tint, W_DISTANCE } from "./render.ts";
import { byLength, cast, cube, extent } from "./shadow.ts";
import { angleName, snapAngle } from "./turn.ts";
import { addSlider, bracket, coords, num, span } from "./ui.ts";

// What the numbers view shows on a step.
type Panel = "point" | "segment" | "cube" | "check" | "tesseract" | "formula" | "distort" | "sandbox";

// The 3D planes, in the panel's fixed order.
const TURNS: Plane[] = ["xy", "xz", "yz"];

// Each step's rung (the shape's dimension) and the planes it has sliders for; the others
// go back to 0.
const STEPS: { rung: number; panel: Panel; planes: Plane[] }[] = [
  { rung: 1, panel: "point", planes: [] },
  { rung: 2, panel: "segment", planes: ["xy"] },
  { rung: 3, panel: "cube", planes: [] },
  { rung: 3, panel: "check", planes: [] },
  { rung: 4, panel: "tesseract", planes: [] },
  { rung: 4, panel: "formula", planes: [] },
  { rung: 4, panel: "distort", planes: [] },
  { rung: 4, panel: "sandbox", planes: TURNS },
];
// The step whose toggle compares straight-on and perspective shadows.
const TOGGLE = 2;
const ZERO = { xy: 0, xz: 0, yz: 0, xw: 0, yw: 0, zw: 0 };

// On the lower rungs, the screen stands at −1.5 along the direction cast across, just
// behind the shape, and the perspective viewer at W_DISTANCE on the other side, the same
// distance as the tesseract's viewer along w.
const SCREEN = -1.5;
const VIEWER = W_DISTANCE;
// How far the screen reaches either side of its centre.
const SCREEN_REACH = 2.4;
const EDGE_ALPHA = 0.95;
const FACE_ALPHA = 0.05;
const SHADOW_ALPHA = 0.6;
const SHADOW_FILL = 0.06;
const SCREEN_ALPHA = 0.2;
const SCREEN_FILL = 0.02;
const RAY_ALPHA = 0.12;
// The distortion step: the cube being looked at, and the rest.
const LIT_FILL = 0.1;
const GHOST = 0.12;

const TESSERACT = cube(4);
// The tesseract's 8 cubes, each holding one coordinate at −1 or +1: cube c holds
// coordinate c >> 1 at bit c & 1.
const inCell = (c: number, i: number) => ((i >> (c >> 1)) & 1) === (c & 1);
const cellName = (c: number) => `${AXES[c >> 1]} = ${c & 1 ? "+1" : "−1"}`;
// The two corners the formula step follows: near (1, 1, 1, 1) and far (1, 1, 1, −1).
const FOLLOW = [15, 7];

const triple = (v: number[]) => coords(v, 3);

export const lesson7: Lesson = {
  title: "Shadows",
  views: [{ caption: "Shadow", label: "Shapes and their shadows one dimension down, up to the tesseract's shadow along w" }, { caption: "Numbers" }],
  steps: [
    {
      text: `<p>How do we see a shape from one dimension up? We already do it: this screen is
        flat, yet it shows 3D shapes. What it shows is a <em>shadow</em>, the shape cast one
        dimension down.</p><p>Start at the bottom. A segment casts its shadow along its own
        line onto a point, the whole of a 0D world. Every point of the segment lands on that
        one point: the shadow keeps nothing of its length.</p>`,
    },
    {
      text: `<p>One rung up, a square casts its shadow straight down onto a line, a 1D world.
        The shadow is a segment.</p><p>Drag xy. As the square turns, its shadow grows and
        shrinks: 2 long face-on, 2√2 corner-on. A 1D viewer sees only that segment
        changing, and has to work out the square from it.</p>`,
    },
    {
      text: `<p>Now a cube, face-on, and its shadow on a flat screen behind it. Straight on,
        the light runs along z and the shadow just drops z: the back face hides exactly
        behind the front, and the shadow is one square.</p><p>An eye sees in
        <em>perspective</em> instead: rays spread from a viewer at z = 3, so nearer is
        bigger. Switch to it: the near face casts a bigger square than the far one, a square
        inside a square, joined corner to corner.</p>`,
      hold: true,
    },
    {
      text: `<p>Climb once more. The tesseract is two cubes, one at w = −1 and one at w = 1,
        joined corner to corner along w, just as the cube is two squares joined along
        z.</p><p>Cast it along w in perspective, from a viewer at w = 3. What will its
        shadow look like?</p>`,
      check: {
        prompts: [{ label: "The shadow", choices: ["one cube", "a cube in a cube", "a square in a square"], answer: "a cube in a cube" }],
        after: `A cube inside a cube, joined corner to corner: the near cube (w = 1) casts the
          big one outside, the far cube (w = −1) the small one inside.`,
      },
    },
    {
      text: `<p>Here it is. The outer cube is the near one, w = 1, tinted warm; the inner is
        the far one, w = −1, tinted cool. The 8 edges joining them run along w.</p><p>There
        is no screen to draw this time: a 4D shape's shadow is a 3D shape, and this whole
        view is it. Your flat screen then shows that 3D shadow like any 3D object, as a
        shadow of a shadow.</p>`,
    },
    {
      text: `<p>The perspective is one division. For a viewer at distance d along w, a
        corner's shadow is its (x, y, z) scaled by</p><p class="formula">d / (d − w)</p>
        <p>Here d = 3. The near corner (1, 1, 1, 1) scales by 3/2 and lands on
        (1.5, 1.5, 1.5); the far one, (1, 1, 1, −1), by 3/4, on (0.75, 0.75, 0.75). At
        w = 0 the scale is 1: nothing changes.</p>`,
    },
    {
      text: `<p>A shadow distorts. All 32 of the tesseract's edges are 2 long, yet here the
        inner ones are 1.5, the outer ones 3 and the joining ones about 1.3.</p><p>Its 8
        cubes are identical too, but only two look it. Step through them: the other six
        are squashed into boxes with one big face and one small, like the sides of the
        cube's perspective shadow.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> Turn the tesseract's shadow in xy, xz and yz.</p>
        <p>These planes leave w alone, so every corner keeps its scale and the shadow only
        turns, as a 3D object does. Turning into w is the next lesson.</p>`,
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
    // On the toggle step, whether the cube's shadow is in perspective.
    let perspective = false;
    // On the distortion step, the cube being looked at.
    let cell = 1;

    const mark = (text: string, className: string, v: Vec4) => {
      const el = marks.appendChild(span(text, className));
      el.style.setProperty("--tint", css(tint(v[3])));
      const [left, top] = view.screen(v);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    // The numbers view for the current step; `turned` are the shape's turned corners and
    // `shadows` their shadows.
    const fill = (turned: Vec4[], shadows: Vec4[]) => {
      const { panel } = STEPS[step]!;
      const line = (text: string, className = "line") => numbers.appendChild(span(text, className));
      numbers.replaceChildren();
      if (panel === "point") {
        line("segment: x from −1 to 1");
        line(`shadow: one point, x = ${num(SCREEN)}`);
        numbers.appendChild(span("every point of the segment lands on it", "note"));
      }
      if (panel === "segment") {
        const xs = shadows.map((v) => v[0]);
        line(`xy = ${angleName(angles.xy)}`);
        line(`shadow: x from ${num(Math.min(...xs))} to ${num(Math.max(...xs))}`);
        line(`length ${num(extent(xs))}`);
        numbers.appendChild(span("the square's sides are 2", "note"));
      }
      if (panel === "cube" || panel === "check") {
        const width = (z: number) => num(extent(shadows.filter((_, i) => turned[i]![2] === z).map((v) => v[0])));
        if (panel === "cube" && !perspective) {
          line("straight on: (x, y, z) → (x, y)");
          line(`both faces: ${width(1)} wide`);
          numbers.appendChild(span("the back face hides behind the front", "note"));
        } else {
          line(`perspective, viewer at z = ${VIEWER}`);
          line(`near face, z = 1: ${width(1)} wide`);
          line(`far face, z = −1: ${width(-1)} wide`);
          numbers.appendChild(span("both faces are 2 wide; nearer is bigger", "note"));
        }
        if (panel === "check") line("the tesseract along w: ?");
      }
      if (panel === "tesseract") {
        line(`perspective, viewer at w = ${W_DISTANCE}`);
        line("near cube, w = 1: outside, warm");
        line("far cube, w = −1: inside, cool");
      }
      if (panel === "formula") {
        line(`shadow = d / (d − w) · (x, y, z), d = ${W_DISTANCE}`);
        for (const i of FOLLOW) {
          const v = TESSERACT.vertices[i]!;
          const k = W_DISTANCE / (W_DISTANCE - v[3]);
          line(`w = ${num(v[3])}: ${W_DISTANCE} / ${num(W_DISTANCE - v[3])} = ${num(k)}`);
          numbers.appendChild(span(`${coords(v, 4)} → ${triple(shadows[i]!)}`, "then"));
        }
      }
      if (panel === "distort") {
        line(`cube ${cell + 1} of 8: ${cellName(cell)}`);
        line("every edge: 2 long");
        const names = ["joining", "inner", "outer"];
        byLength(TESSERACT.edges.map(([a, b]) => Math.hypot(...[0, 1, 2].map((k) => shadows[a]![k]! - shadows[b]![k]!)))).forEach(({ length, count }, k) =>
          line(`in the shadow, ${count} ${names[k]}: ${num(length)}`),
        );
      }
      if (panel === "sandbox") {
        line(TURNS.map((p) => `${p} = ${angleName(angles[p])}`).join(", "));
        numbers.append(bracket(corner(rotation(angles), 3).map((row) => row.map(num))));
        numbers.appendChild(span("w doesn't change: each corner keeps its scale, 3/4 or 3/2", "note"));
      }
    };

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const { rung, panel } = STEPS[step]!;
        const m = rotation(angles);
        marks.replaceChildren();
        if (rung === 4) {
          const turned = TESSERACT.vertices.map((v) => apply(m, v));
          const lit = panel === "distort";
          const inLit = (corners: number[]) => corners.every((i) => inCell(cell, i));
          view.draw(
            TESSERACT.edges.map(([a, b]) => ({ from: turned[a]!, to: turned[b]!, alpha: !lit || inLit([a, b]) ? EDGE_ALPHA : GHOST })),
            TESSERACT.faces.map((face) => ({ corners: face.map((i) => turned[i]!), alpha: lit && inLit(face) ? LIT_FILL : FACE_ALPHA })),
          );
          if (panel === "formula") for (const i of FOLLOW) mark(triple(projectW(turned[i]!, W_DISTANCE)), "corner new", turned[i]!);
          fill(turned, turned.map((v) => [...projectW(v, W_DISTANCE), v[3]] as Vec4));
          return;
        }

        // The lower rungs: the shape, its screen, its shadow on the screen, and the rays.
        const shape = cube(rung);
        const axis = rung - 1;
        const viewer = rung === 3 && (step !== TOGGLE || perspective) ? VIEWER : null;
        const turned = shape.vertices.map((v) => apply(m, v));
        const shadows = turned.map((v) => cast(v, axis, SCREEN, viewer));
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
          ...turned.map((v, i) => ({ from: viewer === null ? v : eye, to: shadows[i]!, alpha: RAY_ALPHA })),
          ...shape.edges.map(([a, b]) => ({ from: shadows[a]!, to: shadows[b]!, alpha: SHADOW_ALPHA })),
          ...shape.edges.map(([a, b]) => ({ from: turned[a]!, to: turned[b]!, alpha: EDGE_ALPHA })),
        ];
        const faces = [
          ...(screen.length === 4 ? [{ corners: screen, alpha: SCREEN_FILL }] : []),
          ...shape.faces.map((face) => ({ corners: face.map((i) => shadows[i]!), alpha: SHADOW_FILL })),
          ...shape.faces.map((face) => ({ corners: face.map((i) => turned[i]!), alpha: FACE_ALPHA })),
        ];
        view.draw(segments, faces);
        if (rung === 1) mark("", "point", shadows[0]!);
        if (viewer !== null) mark("viewer", "corner new", eye);
        fill(turned, shadows);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return {
      show(i, done) {
        step = i;
        const { planes, panel } = STEPS[i]!;
        for (const plane of TURNS) if (!planes.includes(plane)) angles[plane] = 0;
        for (const plane of planes)
          addSlider(controls, plane, 0, 2 * Math.PI, angles[plane], (x) => ((angles[plane] = snapAngle(x)), schedule()), (x) => angleName(snapAngle(x)));
        if (i === TOGGLE) {
          perspective = false;
          const button = Object.assign(document.createElement("button"), { type: "button", textContent: "Perspective" });
          button.addEventListener("click", () => {
            perspective = !perspective;
            button.textContent = perspective ? "Straight on" : "Perspective";
            done();
            schedule();
          });
          controls.append(button);
        }
        if (panel === "distort") {
          cell = 1;
          addSlider(controls, "cube", 0, 7, cell, (x) => ((cell = x), schedule()), (x) => String(x + 1), 1);
        }
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
