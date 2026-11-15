# Higher Dimensions

A public, browser-based course for properly learning how dimensions work: 4D first, then
5D, 6D and beyond. Guided lessons build up by analogy (2D → 3D → 4D → …), and each lesson
ends in an interactive sandbox. Visuals give the intuition, and the coordinates and
matrices are shown next to them so the learner sees *why* things move the way they do.

Live at <https://instructional-pages.github.io/higher-dimensions/>.

Status: all 12 lessons ("Where is a point?", "Building by extrusion", "Counting corners and
edges", "Squares, cubes and beyond", "Turning in a plane", "Planes, not axes", "Shadows",
"Turning into w", "Slicing", "Slicing a turning shape", "Unfolding", "Everything
linked") built, in a lesson shell with text steps,
predict-then-reveal checks and a sandbox, plus the tesseract sandbox (projection, slice
and net views, one main and two small, six rotation sliders, a cut slider and a fold
slider, live 4×4 matrix and corner coordinates). See [docs/BRIEF.md](docs/BRIEF.md), the lesson outline in
[docs/LESSONS.md](docs/LESSONS.md), and [CHANGELOG.md](CHANGELOG.md).

Develop with `npm install` then `npm run dev`. Checks: `./.local-ci` (typecheck, unit
tests, build, bundle-size budget); `npm test` runs the unit tests alone.

Deploy (GitHub Pages, from this machine, no Actions): on an up-to-date, clean `main`, run
`npm run deploy`. It builds, checks the bundle budget, and force-pushes `dist/` as a single
commit to the `gh-pages` branch; `npm run deploy -- --dry-run` does everything but the push.
Pages serves that branch at <https://instructional-pages.github.io/higher-dimensions/>
(GitHub turned Pages on for `gh-pages` when the branch was first pushed).

License: [MIT](LICENSE).
