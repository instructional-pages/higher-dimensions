# Decisions

Each entry: the question, the choice, and why. Newest at the bottom.
Entries dated 2026-10-27 were settled while writing the brief (`docs/BRIEF.md`).

## 2026-10-27: Name and owner

- **Question:** What is the project called, and where does it live?
- **Choice:** `higher-dimensions-explorer`, under `ntfifwyb` (personal account).
- **Why:** Full descriptive name per the workspace naming rule; it's a personal learning project.

## 2026-10-27: Learner level

- **Question:** Who is the course pitched at?
- **Choice:** Beginner: knows 3D well, little linear algebra. Lessons teach the vectors and matrices they use.
- **Why:** That's the first user; other explainers either stay at pretty pictures or assume the math.

## 2026-10-27: Intuition or math

- **Question:** Visual intuition, or the underlying math?
- **Choice:** Both: visuals first, with coordinates and rotation matrices shown alongside.
- **Why:** The goal is to understand *why* things move, not just watch them.

## 2026-10-27: Lessons or sandbox

- **Question:** Free sandbox, or guided lessons?
- **Choice:** Guided lessons, each ending in a sandbox.
- **Why:** A beginner needs a path; the sandbox lets them test what they just learned.

## 2026-10-27: Views

- **Question:** Which ways of showing a higher-dimensional shape?
- **Choice:** Projection (shadows), cross-sections (slices), unfolded nets, and linked views that move together. All four at MVP.
- **Why:** Each view shows something the others hide; linking them is what no other explainer offers.

## 2026-10-27: Shapes and dimensions

- **Question:** Which shapes, and how high?
- **Choice:** Eventually all shape families (simplices, cross-polytopes, hyperspheres, user-defined) and any n, with depth tapering after 4D. MVP: hypercubes from 2D to 4D only.
- **Why:** Keeps the MVP small while the long-term scope stays clear.

## 2026-10-27: Other topics

- **Question:** Topics beyond geometry?
- **Choice:** Time as a dimension and the extra dimensions of physics, later.
- **Why:** Wanted, but after the geometry is solid.

## 2026-10-27: Controls

- **Question:** How does the learner rotate shapes?
- **Choice:** Sliders only, one per rotation plane (xy, xz, xw, yw, zw, …). No mouse-drag rotation.
- **Why:** A slider maps one-to-one onto a matrix entry the learner can read.

## 2026-10-27: Platform and rendering

- **Question:** Where does it run, and how is it drawn?
- **Choice:** Desktop web browser; plain WebGL2, no framework (no three.js).
- **Why:** Performance and a small bundle get top priority.

## 2026-10-27: Tooling

- **Question:** Language and build tool?
- **Choice:** TypeScript + Vite.
- **Why:** Typed math code, fast dev loop, small static output.

## 2026-10-27: Math typesetting

- **Question:** How are matrices and formulas shown?
- **Choice:** Plain HTML/CSS, no KaTeX.
- **Why:** No extra download; the math needed is vectors and matrices.

## 2026-10-27: Audience

- **Question:** Private tool, or public?
- **Choice:** Public from the start.
- **Why:** Other newcomers should be able to learn from it with no outside help.

## 2026-10-27: Hosting

- **Question:** Where is it hosted?
- **Choice:** GitHub Pages, deployed locally (no Actions).
- **Why:** Free; development costs $0.

## 2026-10-27: License, analytics, language

- **Question:** License, tracking, languages?
- **Choice:** MIT. No analytics of any kind. English only.
- **Why:** Open and simple; nothing to track or translate.

## 2026-10-27: Lesson structure

- **Question:** How are lessons sequenced and paced?
- **Choice:** About 12 fine-grained lessons on a dimension ladder (each climbs 0D → 4D for one idea: build, project, slice, unfold, …). Short text steps beside the live view, advanced with a Next button.
- **Why:** The analogy from lower dimensions is the main teaching tool.

## 2026-10-27: Understanding checks

- **Question:** How does the learner check understanding?
- **Choice:** Predict-then-reveal: predict the next slice or count before it's shown.
- **Why:** Matches the first success criterion (predict what the slice does next).

## 2026-10-27: Look

- **Question:** Visual style?
- **Choice:** Dark, black, spacious, like the universe; terminal-like in color only. System sans-serif (no font download). Thin wireframe edges, very faint faces, filled slices, edges tinted cool to warm by w.
- **Why:** Quiet and fast; the w tint makes 4D depth visible.

## 2026-10-27: Motion

- **Question:** Animation?
- **Choice:** None unless it teaches something. Nets fold with a 0–100% slider, no autoplay.
- **Why:** Minimalism, and the learner stays in control.

## 2026-10-27: Accessibility

- **Question:** How much accessibility at MVP?
- **Choice:** Basics: keyboard-operable sliders, readable contrast, reduced motion respected.
- **Why:** Public from the start.

## 2026-10-27: Layout

- **Question:** How are the views arranged?
- **Choice:** One main view chosen by the lesson, the other views small beside it, linked.
- **Why:** Focus on one view while the others confirm it.

## 2026-10-27: Angle units

- **Question:** Degrees or radians?
- **Choice:** Radians, on sliders and in matrices.
- **Why:** The matrices use them; one unit everywhere.

## 2026-10-27: Saved progress

- **Question:** Remember progress between visits?
- **Choice:** No. Nothing in localStorage; every visit starts fresh.
- **Why:** No backend, no storage, nothing to manage.

## 2026-10-27: Sandbox dimension

- **Question:** Which dimensions does the MVP sandbox offer?
- **Choice:** The tesseract (4D) only; an n picker comes with the generic n-D engine.
- **Why:** Keeps the MVP renderer specific.

## 2026-10-27: Lesson outline first

- **Question:** Build lessons right away, or plan them first?
- **Choice:** The first session drafts the ~12-lesson outline for the user to approve before any lesson is built.
- **Why:** Writing good lessons is most of the work.

## 2026-10-27: Repo visibility

- **Question:** Create the repo public now, or private until there's something to show?
- **Choice:** Public now.
- **Why:** Matches "public from the start"; the repo only holds the spec, committed as the noreply address.

## 2026-10-27: First session scope

- **Question:** First session: outline plus a renderer prototype, or the outline only?
- **Choice:** Outline only, then stop for approval.
- **Why:** User's choice; the renderer prototype comes after the outline is approved.

## 2026-10-27: Lesson outline details

- **Question:** Details the brief left open while drafting `docs/LESSONS.md`.
- **Choice:** Perspective projection along w (cube in a cube); sliders combine in one fixed order shown in the matrix panel, and lesson 6 teaches that rotations in different planes don't commute; 5D and 6D appear only as counts, never drawn; the 4D rotation planes arrive in lesson 8, xw first, then yw and zw; the slice view first appears in lesson 9.
- **Why:** Straight-on projection along w hides the inner cube; a fixed order keeps the matrix readable, and teaching why order matters explains it; drawing 5D needs the generic engine (Later); pacing the sliders addresses the brief's six-planes risk; showing a view before it is taught would confuse a beginner. Confirmed by the user in review of PR #1, which changed the rotation-order and slice-view points.

## 2026-10-27: Bundle budget (decided by Claude, pending review)

- **Question:** How big may the shipped JS and CSS be?
- **Choice:** 50 KiB gzipped in total, enforced by `.local-ci` (`npm run size`).
- **Why:** "Performance and minimalism get huge emphasis": a plain-WebGL2 renderer, lesson text and HTML/CSS matrices should fit well under this, so crossing it means something heavy slipped in.

## 2026-10-27: Tesseract renderer details (decided by Claude, pending review)

- **Question:** Details the renderer needed that the brief and outline left open.
- **Choice:** Sliders combine in the order xy, xz, yz, xw, yw, zw (M = R_zw·…·R_xy, xy
  applied first); each slider runs 0 to 2π in steps of 0.01. Tesseract corners sit at
  ±1, the viewer is at w = 3 (far cube scaled 3/4, near cube 3/2). The 3D shadow is seen
  through a fixed camera slightly above and to the side. The 4D math runs on the CPU
  and frames are drawn only when a slider moves, not in a loop. Unit tests use Node's
  built-in runner (`node --test`), no test framework.
- **Why:** The order puts the w-fixed planes first, as the lessons introduce them, and
  matches lesson 6's worked example (xy then xz). 0 to 2π covers a full turn, the lesson
  8 check. A fixed camera keeps sliders the only control while still reading as 3D.
  16 corners cost about 22 µs per frame on the CPU, so no shader math is needed, and
  drawing on demand keeps an idle page at zero cost. Node's runner adds nothing to
  install.

## 2026-10-28: Slice view details (decided by Claude, pending review)

- **Question:** Details the slice view needed that the brief and outline left open.
- **Choice:** The cut is the hyperplane w = h in the rotated shape's coordinates, with an
  h slider from −2 to 2 (the reach of the rotated corners). The slice sits beside the
  shadow at the same size and camera, filled with its faces shaded by how squarely they
  face the camera, and hidden edges hidden. It is tinted by h, the same cool-to-warm
  scale as the shadow's edges. The current slice is also marked, faintly filled, inside
  the shadow. Past the shape the slice view is simply empty.
- **Why:** Cutting the rotated shape at a fixed w is lesson 10's model (the shape turns,
  the cut stays put). Same camera and tint let the two views be compared directly;
  shading makes a filled solid read as 3D. Marking the slice in the shadow shows where
  the cut is, a first step toward the linked views.

## 2026-10-28: Net view coloring and sliders

- **Question:** Tint the net's cubes by w, or give opposite pairs a shared color (as the
  lesson 11 outline says)? And which sliders turn the net?
- **Choice:** Tint by w, like every other view. Only xy, xz and yz turn the net.
- **Why:** The w tint shows the cubes leaving our space as they fold; pair colors can come
  with lesson 11 itself. The 3D turns keep every point's w, so the wide net stays clear of
  the viewer at w = 3, and they match lesson 11's sandbox. Fully folded, the net matches the
  shadow only while the w sliders are at 0. User's choice.

## 2026-10-28: Net view details (decided by Claude, pending review)

- **Question:** Details the net view needed that the brief and outline left open.
- **Choice:** The base cube is the cell w = +1. The cells x = ±1, y = ±1 and z = ±1 hinge on
  its faces, and w = −1 hinges on the far face of y = −1, so the column is y = +1, base,
  y = −1, w = −1 and the outline's check (the top cube is opposite the third) holds. Flat,
  the net lies in w = 1. Each hinge turns about its shared square in one space axis and w,
  by (1 − fold) · 90°; the slider starts at 0% (flat). The net is drawn like the shadow
  (perspective along w, thin edges, faint faces) as a third view, from further back so the
  whole flat net fits, so the folded tesseract looks smaller than in the shadow view. It
  turns about the flat net's centre.
- **Why:** Putting the base at the viewer's side (w = +1) folds the cubes away from the
  viewer, so mid-fold they shrink instead of swelling (the furthest corner reaches
  w ≈ −2.52); folding toward the viewer would reach w ≈ 2.52, enlarged 6×. One fixed
  framing keeps sizes comparable across the fold: the cross visibly closes up into a box.

## 2026-10-28: Linked views and corner coordinates

- **Question:** How should the three views be laid out and the main one picked, and which
  coordinates go next to the matrix?
- **Choice:** The main view fills the left; the other two are stacked in a narrow column
  beside it. Clicking a small view (or Enter on it) swaps it in. Under the matrix, four
  corners A–D show their start and where M sends them, and are marked with labelled dots
  in the shadow.
- **Why:** The main view keeps most of the room while the others stay in sight for
  comparison; clicking needs no extra controls. Start → turned makes M·v visible without
  a wall of 16 rows, and the marks tie the numbers to the picture. User's choice.

## 2026-10-28: Linked view details (decided by Claude, pending review)

- **Question:** Details the linked views needed that the choices above left open.
- **Choice:** The shadow starts as the main view, the small column is 24% of the views'
  width (at least 12rem), and the main view's choice isn't remembered (nothing in
  localStorage). The corners are A (1, 1, 1, 1), B (−1, 1, 1, 1), C (1, 1, 1, −1) and
  D = −A, laid out in the matrix's columns. Marks are HTML over the canvas, placed with the
  same camera as the drawing, and stay on the shadow when it is small.
- **Why:** A and B differ in x, A and C in w, and D is opposite, so one table shows an
  ordinary edge, an edge into w and the centre symmetry (D's turned coordinates are always
  minus A's). Sharing columns with the matrix lets the learner read M·v off row by row.
  HTML marks need no text rendering in WebGL.

## 2026-10-28: Lesson navigation, rungs and checks

- **Question:** One page per lesson or a single page? How are lesson 1's 0D–3D rungs
  drawn? How does the learner answer a check?
- **Choice:** One page; the URL hash names the lesson (`#1`), the sandbox (`#sandbox`) or,
  with no hash, the contents. The rungs use the same WebGL renderer and camera as the
  tesseract. A check asks for a typed number per prompt, and Reveal marks each one.
- **Why:** One small bundle and instant switching, while every lesson still has its own
  address and the Back button works. One look at every rung makes 4D read as the next
  step of the same picture. Typing a number forces a real prediction, where choices
  invite guessing. User's choice.

## 2026-10-28: Lesson shell and lesson 1 details (decided by Claude, pending review)

- **Question:** Details the shell and lesson 1 needed that the outline left open.
- **Choice:**
  - The contents page lists all 12 lessons, unbuilt ones muted, plus a link to the
    sandbox. An unbuilt lesson's address shows the contents.
  - Steps have Back as well as Next; the step number isn't in the URL, so a reload starts
    the lesson over. Reveal waits for a number in every prompt, and Next waits for
    Reveal, once: going back to a revealed check doesn't hold Next again. The last step's
    button leads to the next lesson, or to the contents after the last one built.
  - Lesson 1 has seven steps: 0D, 1D, 2D, 3D, 4D, the check (4D and 7D), and the sandbox.
    Each rung adds its axis and slider (−1 to 1, starting at 0); going back to a lower
    rung sets the dropped coordinates to 0. A line walks the point out from the origin
    along x, then y, z and w, one step per coordinate. The point and axis names are HTML
    over the canvas, like the corner marks; the point is tinted by w.
  - The coordinate column is an HTML view, swappable like the others, and the w color
    scale appears under it at 4D.
  - Changing page rebuilds it and frees the old WebGL contexts at once.
- **Why:** The full list shows where the course goes without links that lead nowhere.
  Back lets the learner reread a step; nothing is saved, so the step needn't survive a
  reload. Starting each new axis at 0 shows the point hasn't moved into it yet. The walk
  makes each number a step along its own direction, and in 4D the last step, along w,
  goes outward from the centre and changes color, which is exactly what w does in a
  shadow. Browsers cap the number of live WebGL contexts, so switching pages often
  mustn't leak them.
