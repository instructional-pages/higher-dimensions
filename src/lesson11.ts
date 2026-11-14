// Lesson 11, "Unfolding": a shape's boundary cut open and laid flat one dimension down,
// its net, then folded back up to show how the pieces join. The ladder folds the square's
// 4 segments in a line, the cube's cross of 6 squares and the tesseract's cross of 8
// cubes, which leave our space mid-fold. Opposite pieces are lit a pair at a time (color
// stays w's alone), and every piece carries a number so the checks can ask about one.

import type { Lesson } from "./lesson.ts";
import { AXES, apply, rotation, type Angles, type Mat4, type Plane, type Vec4 } from "./math4d.ts";
import { net, order } from "./net.ts";
import { createLineView, createNetView, NET_FRAMES } from "./render.ts";
import { angles } from "./turning.ts";
import { angleName, snapAngle } from "./turn.ts";
import { addSlider, span } from "./ui.ts";

// Each step's rung, where its fold starts (no fold slider when null), whether Next
// waits for the net to be folded all the way, the pairs it has buttons for (by axis), whether it has the 3D turns, and
// what a check's reveal shows: the next rung flat, or a pair lit.
const STEPS: { rung: number; fold: number | null; hold?: boolean; pairs?: number; turns?: boolean; reveal?: { rung?: number; pair?: number } }[] = [
  { rung: 2, fold: 0, hold: true },
  { rung: 3, fold: 0, hold: true },
  { rung: 3, fold: 0, pairs: 3 },
  { rung: 3, fold: null, reveal: { rung: 4 } },
  { rung: 4, fold: 0, hold: true },
  { rung: 4, fold: 1, turns: true },
  { rung: 4, fold: 0, reveal: { pair: 1 } },
  { rung: 4, fold: 0, pairs: 4 },
  { rung: 4, fold: 0, pairs: 4, turns: true },
];

// What each rung's net is made of, for screen readers.
const NAMES: Record<number, string> = { 2: "a square's 4 segments", 3: "a cube's 6 squares", 4: "the tesseract's 8 cubes" };
const FOLDED_EDGE = 0.95;
const FOLDED_DIM = 0.22;
const FOLDED_FACE = 0.03;
const FOLDED_LIT_FACE = 0.09;
const FOLDED_DIM_FACE = 0.012;
const TURNS: Plane[] = ["xy", "xz", "yz"];
const FULL = 2 * Math.PI;

const percent = (x: number) => `${Math.round(x * 100)}%`;
const CUBES = ["2", "3", "4", "5", "6", "7", "8"];

export const lesson11: Lesson = {
  title: "Unfolding",
  views: [
    { caption: "Net", label: "A shape's boundary cut open and laid flat one dimension down, folding back up, each piece numbered" },
    { caption: "Folded", label: "The same shape folded up, the lit pair of opposite pieces bright in it" },
  ],
  steps: [
    {
      text: `<p>A third way to see a shape one dimension down: cut its boundary open and lay
        it flat. That flat pattern is its <em>net</em>.</p><p>A square's boundary is 4
        segments. Cut it open at one corner and it lies flat as 4 segments in a line.</p>
        <p>Drag fold to 100%: each segment hinges on the corner it shares with its
        neighbour, and they close up into the square.</p>`,
      hold: true,
    },
    {
      text: `<p>One rung up. A cube's boundary is 6 squares. Cut along 7 of its edges and it
        lies flat as a cross: a column of four squares with one on each side of the
        second.</p><p>Fold it up. Each square hinges on the edge it shares with its
        neighbour in the net, and the cross closes into the cube.</p>`,
      hold: true,
    },
    {
      text: `<p>Which squares end up opposite each other? Light the pairs and fold.</p>
        <p>Pair y lights 1 and 3: the column wraps around the cube, so the top square is
        opposite the <em>third</em>, not the last. The last, 4, is opposite the base, 2
        (pair z), and 5 and 6 sit on either side (pair x).</p><p>The square's line works
        the same way: 1 is opposite 3, and 2 opposite 4.</p>`,
    },
    {
      text: `<p>One rung up again. The tesseract's boundary is made of cubes, and its net is
        laid out in our 3D space, just as the cube's net lies in a flat plane.</p><p>How
        many cubes does it have?</p>`,
      check: {
        prompts: [{ label: "Cubes in its net", answer: 8 }],
        after: `8, two along each of its 4 axes (the cube has 6 squares, two along each of
          its 3). It's the 8 cubic cells of lesson 4. Here they are, laid flat: a column of
          four with one cube on each of the 4 side faces of the second.`,
      },
    },
    {
      text: `<p>Now fold it. Each cube hinges on the square it shares with its neighbour in
        the net, but it can't turn anywhere in our space: there is no room. It turns into
        w.</p><p>Watch mid-fold: the cubes leave our space. The tint cools as their w drops,
        and they shrink, as they move away from you along w. At 100% they close up into
        the tesseract's shadow, a cube in a cube.</p>`,
      hold: true,
    },
    {
      text: `<p>How do the pieces join? Folded, every edge of every square in the cube's net
        meets exactly one other square: 6 × 4 = 24 square sides, glued in pairs into the
        cube's 12 edges. In the flat net only 5 of those were joined, the hinges; folding
        glues the other 7.</p><p>One rung up, every square face of every cube is glued to
        exactly one other cube: 8 × 6 = 48 cube faces, glued in pairs into the tesseract's
        24 squares. Flat, only 7 are joined; folding glues the other 17. Turn the folded
        tesseract and fold back and forth to see them meet.</p>`,
    },
    {
      text: `<p>Your turn. Which cube in the tesseract's net is opposite the top one, cube
        1? Fold it up and down to help yourself.</p>`,
      check: {
        prompts: [{ label: "Opposite cube 1", choices: CUBES, answer: "3" }],
        after: `3, the third in the column. The column wraps around like the cube's row of
          four squares: 1 and 3 are y = +1 and y = −1, now lit. The last, 4, is opposite
          the base, 2.`,
      },
    },
    {
      text: `<p>The tesseract has four pairs, one per axis. Pair w lights 2 and 4: in the
        shadow they are the outer cube and the inner one, the cube in a cube. Pairs x and z
        are the cubes on either side.</p><p>Opposite cubes never touch, flat or folded:
        every other cube shares a square with each of them.</p>`,
    },
    {
      text: `<p><strong>Sandbox.</strong> The tesseract's net with the fold, the pairs, and
        xy, xz and yz to look around it.</p><p>They keep every point's w, so the net turns
        like any 3D object. Fold it halfway and turn it: which cubes have left our space
        the furthest?</p>`,
    },
  ],
  start(figures, controls) {
    const [netFigure, foldedFigure] = figures as [HTMLElement, HTMLElement];
    const netCanvas = netFigure.querySelector("canvas")!;
    const foldedCanvas = foldedFigure.querySelector("canvas")!;
    const netView = createNetView(netCanvas);
    const folded = createLineView(foldedCanvas);
    if (!netView || !folded) return null;
    const marks = netFigure.appendChild(Object.assign(document.createElement("div"), { className: "marks" }));

    let rung = 2;
    let fold = 0;
    let pair: number | null = null;
    let turned = angles();
    let buttons: HTMLButtonElement[] = [];

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const turn: Mat4 = rotation(turned);
        const lit = pair === null ? [] : [2 * pair, 2 * pair + 1];
        const flat = net(fold, rung);
        netView.draw(flat, turn, lit, NET_FRAMES[rung]);

        // Each piece's number at its middle, bright when lit or nothing is.
        marks.replaceChildren();
        order(rung).forEach((c, k) => {
          const cell = flat.cells[c]!;
          const middle = [0, 1, 2, 3].map((i) => cell.reduce((s, v) => s + flat.vertices[v]![i]!, 0) / cell.length) as Vec4;
          const label = marks.appendChild(span(String(k + 1), lit.length && !lit.includes(c) ? "label" : "label lit"));
          const [left, top] = netView.screen(middle);
          label.style.left = `${left}px`;
          label.style.top = `${top}px`;
        });

        // The folded shape, turned the same way, its lit pair bright.
        const shape = net(1, rung);
        const bright = new Set(lit.flatMap((c) => shape.cells[c]!));
        const at = shape.vertices.map((v) => apply(turn, v));
        const alpha = (i: number, on: number, off: number, plain: number) => (!lit.length ? plain : bright.has(i) ? on : off);
        folded.draw(
          shape.edges.map(([a, b]) => ({ from: at[a]!, to: at[b]!, alpha: alpha(a, FOLDED_EDGE, FOLDED_DIM, FOLDED_EDGE) })),
          shape.faces.map((face) => ({ corners: face.map((i) => at[i]!), alpha: alpha(face[0], FOLDED_LIT_FACE, FOLDED_DIM_FACE, FOLDED_FACE) })),
        );
        buttons.forEach((b, k) => (b.ariaPressed = String(pair === k)));
      });
    };

    // One button per pair of opposite pieces; pressing the lit one turns it off.
    const addPairs = (count: number) => {
      const row = Object.assign(document.createElement("div"), { className: "choices", role: "group", ariaLabel: "Opposite pairs" });
      buttons = AXES.slice(0, count).map((axis, k) => {
        const button = Object.assign(document.createElement("button"), { type: "button", textContent: `Pair ${axis}` });
        button.addEventListener("click", () => ((pair = pair === k ? null : k), schedule()));
        return button;
      });
      row.append(...buttons);
      controls.append(row);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(netCanvas);
    resize.observe(foldedCanvas);

    return {
      show(i, done) {
        const { rung: r, fold: f, hold, pairs, turns } = STEPS[i]!;
        rung = r;
        fold = f ?? 0;
        pair = null;
        turned = angles();
        buttons = [];
        netCanvas.ariaLabel = `The net: ${NAMES[rung]}, laid flat and folding back up, each numbered`;
        if (f !== null)
          addSlider(
            controls,
            "fold",
            0,
            1,
            fold,
            (x) => {
              fold = x;
              if (hold && x >= 1) done();
              schedule();
            },
            percent,
          );
        if (pairs) addPairs(pairs);
        if (turns)
          for (const plane of TURNS)
            addSlider(
              controls,
              plane,
              0,
              FULL,
              0,
              (x) => ((turned = { ...turned, [plane]: snapAngle(x) } as Angles), schedule()),
              (x) => angleName(snapAngle(x)),
            );
        schedule();
      },
      reveal(i) {
        const after = STEPS[i]!.reveal;
        if (!after) return;
        if (after.rung) (rung = after.rung), (netCanvas.ariaLabel = `The net: ${NAMES[rung]}, laid flat, each numbered`);
        if (after.pair !== undefined) pair = after.pair;
        schedule();
      },
      stop: () => resize.disconnect(),
    };
  },
};
