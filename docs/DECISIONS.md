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
