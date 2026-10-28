# Higher Dimensions Explorer

A public, browser-based course for properly learning how dimensions work: 4D first, then
5D, 6D and beyond. Guided lessons build up by analogy (2D → 3D → 4D → …), and each lesson
ends in an interactive sandbox. Visuals give the intuition, and the coordinates and
matrices are shown next to them so the learner sees *why* things move the way they do.

Status: lessons 1 to 3 ("Where is a point?", "Building by extrusion", "Counting corners and
edges") of 12, in a lesson shell with text steps,
predict-then-reveal checks and a sandbox, plus the tesseract sandbox (projection, slice
and net views, one main and two small, six rotation sliders, a cut slider and a fold
slider, live 4×4 matrix and corner coordinates). See [docs/BRIEF.md](docs/BRIEF.md), the lesson outline in
[docs/LESSONS.md](docs/LESSONS.md), and [CHANGELOG.md](CHANGELOG.md).

Develop with `npm install` then `npm run dev`. Checks: `./.local-ci` (typecheck, unit
tests, build, bundle-size budget); `npm test` runs the unit tests alone.

License: [MIT](LICENSE).
