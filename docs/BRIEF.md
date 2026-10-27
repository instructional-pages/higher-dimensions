> Copied from the project backlog on 2026-10-27; now maintained here.

---
title: Higher Dimensions Explorer
status: ready
created: 2026-10-27
updated: 2026-10-27
owner: ntfifwyb
repo:
tags: [education, math, visualization, interactive, web]
stack: [typescript, vite, webgl2]
effort:
priority:
---

# Higher Dimensions Explorer

## Summary *

A public, browser-based course for properly learning how dimensions work: 4D first, then
5D, 6D and beyond. Guided lessons build up by analogy (2D → 3D → 4D → …), and each lesson
ends in an interactive sandbox. Visuals give the intuition, and the coordinates and
matrices are shown next to them so the learner sees *why* things move the way they do.
It's built for a beginner (the user), but public from the start. It is very fast and
minimal, and looks dark and spacious, like the universe.

## Problem *

The user wants to really understand higher dimensions, not just watch a rotating
tesseract. They know 3D well and have little linear algebra. Explanations elsewhere
either stay at the "pretty picture" level or assume the math, and none of them let the
learner rotate, slice and unfold a shape while the numbers update alongside.

## Users and context

- First user: the project's owner, a beginner learning for themselves.
- Public from the start: other newcomers to the topic, with no help from anyone.
- Desktop browser. Phones may work, but the layout isn't designed for them.

## Success criteria *

- [ ] When shown a 4D rotation, the learner can predict what the 3D slice does next,
      before it moves.
- [ ] After the lessons, the learner can derive how many vertices, edges and faces an
      n-cube has.
- [ ] A rotating tesseract with all linked views stays at 60 fps in a browser on a
      mid-range laptop.
- [ ] Someone new to the topic finishes the 4D lessons without outside help.

## Scope *

### Must (MVP)

- Guided hypercube lessons from 2D up to 4D (square → cube → tesseract), built by
  analogy. Each lesson ends in a sandbox.
- Lessons teach the vectors and matrices they use, assuming a beginner.
- Four views: projection (shadows), cross-sections (slices), unfolded nets, and linked
  views that move together.
- Coordinates and rotation matrices shown next to the visuals.
- Rotation controlled by sliders, one per rotation plane (xy, xz, xw, yw, zw, …).
- About 12 fine-grained lessons, structured as a dimension ladder: each lesson climbs
  0D → 1D → 2D → 3D → 4D for one idea (build, project, slice, unfold, …).
- Each lesson is short text steps beside the live view, advanced with a Next button.
- Predict-then-reveal checks: the learner predicts the next slice or count before it's
  shown.
- Nets fold and unfold with a 0–100% slider (no autoplay).
- The sandbox is the tesseract only (4D); an n picker comes with the generic engine.
- Basic accessibility: keyboard-operable sliders, readable contrast, reduced motion
  respected.

### Later

- Other shapes: simplices, cross-polytopes, hyperspheres, user-defined shapes.
- Any n: a generic n-D engine. 4D gets the richest lessons; 5D and up focus on what
  generalizes and what breaks.
- Lessons beyond geometry: time as a dimension, the extra dimensions of physics
  (string theory) and similar.

### Not doing

- Accounts or a backend. It's a static site.
- Saving progress. Every visit starts fresh (nothing in localStorage).
- VR or AR.
- A mobile-first layout.
- Paid hosting, until the user decides to pay at launch.
- Mouse-drag rotation. Sliders only.
- Decorative animation. Motion only where it teaches something.
- Analytics or tracking of any kind.
- Languages other than English.

## Constraints

- Development costs $0 (workspace rule). Free static hosting only.
- **Performance and minimalism get huge emphasis.** Small bundle, smooth frame rate, no
  unnecessary UI.
- **Look:** dark, like a terminal in color only, *not* a programming or monospace font.
  It should feel like the universe looks: black, spacious, quiet.
- **Typeface:** the system sans-serif, so no font download.
- **Drawing:** thin wireframe edges with very faint faces; slices are filled. Edges are
  tinted cool to warm by their w coordinate, so 4D depth is visible.
- **No animations** unless they are useful for learning.

## Decided

- Name and repo: `higher-dimensions-explorer`, under `ntfifwyb` (personal account).
- Intuition and math together: visuals first, with the numbers alongside.
- Guided lessons, each ending in a sandbox.
- Web app in the browser.
- Rendering in plain WebGL, with no framework (no three.js).
- Public from the start.
- Every view type, every shape family, any n and physics/time topics are all wanted.
  The MVP is 4D hypercube lessons with all four views, and the rest comes later.
- Rotation by sliders only.
- Learner level: beginner (knows 3D, little linear algebra).
- Stack: TypeScript + Vite, WebGL2. Math typeset in plain HTML/CSS (no KaTeX).
- Hosting: GitHub Pages, deployed locally (no Actions).
- License: MIT. No analytics. English only.
- Lessons: ~12, dimension ladder, short steps beside the visual, predict-then-reveal.
- Look: system sans, wireframe + faint faces, color by w, no decorative animation.
- Accessibility: basics at MVP (keyboard, contrast, reduced motion).
- Layout: one main view chosen by the lesson, the other views small beside it, linked.
- Angles in radians, on sliders and in matrices.
- No saved progress.
- The project's first session drafts the 12-lesson outline for the user to approve
  before any lesson is built.

## Open questions *

- [x] Name? → Keep `higher-dimensions-explorer`.
- [x] Starting point? → Beginner: knows 3D, little linear algebra.
- [x] Intuition or math? → Both: visuals first, with the math alongside.
- [x] Sandbox or lessons? → Guided lessons, each ending in a sandbox.
- [x] Visualization methods? → Projection, cross-sections, unfolded nets, linked views.
- [x] Which shapes? → All: hypercubes (MVP), simplices, cross-polytopes, hyperspheres,
      user-defined (Later).
- [x] How high? → Any n, with depth tapering off after 4D.
- [x] Controls? → Sliders only, one per rotation plane.
- [x] Platform? → Web browser, plain WebGL.
- [x] Other topics? → Include physics and time (Later).
- [x] Audience? → Public from the start.
- [x] Success criteria? → The four above.
- [x] MVP / Later / Not doing? → As in Scope.
- [x] GitHub owner? → `ntfifwyb`.
- [x] Lesson sequence? → Dimension ladder.
- [x] Lesson format? → Short steps beside the visual, Next button.
- [x] Understanding checks? → Predict-then-reveal.
- [x] Hosting? → GitHub Pages.
- [x] Showing the 4th axis? → Color edges by w.
- [x] Typeface? → System sans.
- [x] Accessibility? → Basics at MVP; no animations unless useful for learning.
- [x] Language? → English only.
- [x] Tooling? → TypeScript + Vite.
- [x] Shape rendering? → Wireframe + faint faces, filled slices.
- [x] Nets? → Unfold slider.
- [x] License? → MIT.
- [x] Analytics? → None.
- [x] Math typesetting? → Plain HTML/CSS.
- [x] WebGL version? → WebGL2.
- [x] MVP length? → ~12 fine-grained lessons.
- [x] Sandbox dimension? → 4D only at MVP.
- [x] View layout? → One main view plus small linked views.
- [x] Angle units? → Radians.
- [x] Saved progress? → None.
- [x] Lesson outline? → Drafted in the project's first session, approved by the user.

## Risks and unknowns

- With six rotation planes in 4D (and ten in 5D), sliders can overwhelm a beginner.
  Lesson pacing has to bring them in a few at a time.
- Slices and nets are harder to compute than projections, especially unfolding in the
  generic n-D case.
- Writing good lessons is most of the work. The renderer is the smaller part.
- "Public from the start" raises the bar for explanations and onboarding at MVP.

## First session

- Decided: draft the ~12-lesson outline (dimension ladder) for the user to approve.
- Suggested (not decided): a static page with a plain-WebGL renderer that draws a
  tesseract projection with one slider per rotation plane at 60 fps, in the dark,
  minimal style. That proves both the performance goal and the look.

## References

- 

## Log

- 2026-10-27: created. Captured roughly; user will answer the open questions later.
- 2026-10-27: all open questions answered in the same session (scope, MVP, look, stack, owner).
- 2026-10-27: kept at idea; user wants more questions before ready.
- 2026-10-27: second round answered (lessons, look, stack, hosting, accessibility,
  license); still at idea, user wants another round.
- 2026-10-27: third round answered (layout, radians, no saved progress, outline drafted
  at start).
- 2026-10-27: idea → ready
