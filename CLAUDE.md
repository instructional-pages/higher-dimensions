# Higher Dimensions

A public, browser-based course for properly learning how dimensions work: 4D first, then
5D, 6D and beyond. Guided lessons build up by analogy (2D → 3D → 4D → …), and each lesson
ends in an interactive sandbox. Visuals give the intuition, and the coordinates and
matrices are shown next to them so the learner sees *why* things move the way they do.

Part of the `instructional-pages` organization: its shared rules (`../CLAUDE.md`, from
`claude-toolkit`) apply, and this file overrides them.

The spec is `docs/BRIEF.md`; decisions are in `docs/DECISIONS.md`. Check both before
asking the user anything.

- Repo is public: never commit personal paths, emails or secrets.
- Self-merge once `local-ci` passes (workspace default). Deploys go to GitHub Pages, run
  locally, no Actions.

## Not doing

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
