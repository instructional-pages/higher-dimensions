# Changelog

All notable changes are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [0.5.0] - 2026-10-28

### Added

- The course: a contents page listing the 12 lessons, each lesson at its own address
  (`#1`, `#2`, …) and the tesseract sandbox at `#sandbox`. The browser's Back button works.
- The lesson shell: short text steps beside the live view, with Back and Next. A check asks
  you to type your prediction first; Reveal shows the answers, and Next waits for it.
- Lesson 1, "Where is a point?": one point, and one more number for each new direction,
  from 0D to 4D. Each axis brings its slider, a line walks the point out along each axis
  in turn, and the coordinate column grows by one entry per rung. At 4D the point's color
  shows its w, the scale every view uses. Ends in a sandbox.

## [0.4.0] - 2026-10-28

### Added

- Linked views: one view is the main one, large on the left, and the other two sit small
  beside it. Click a small view (or Tab to it and press Enter) to make it the main one.
  Every slider still moves all three.
- Corner coordinates under the matrix: four corners (A–D), each with its starting
  (x, y, z, w) and where the matrix sends it, updating with the sliders. The same corners
  are marked with labelled dots in the shadow, so numbers and picture line up.

## [0.3.0] - 2026-10-28

### Added

- Net view beside the shadow and the slice: the tesseract's boundary cut open into its 8
  cubes, laid out in 3D as a cross (a column of four with a cube on each side of the
  second). Cubes are tinted by w, so as they fold they turn cool and visibly leave our
  space.
- A fold slider (0–100%) hinges the cubes back into the tesseract; fully folded, the net
  is the shadow's cube in a cube. The net turns with xy, xz and yz only.

## [0.2.0] - 2026-10-28

### Added

- Slice view beside the shadow: the tesseract cut by the 3D hyperplane w = h, drawn
  filled with thin edges and tinted by h. Straight on it's a cube; corner first it grows
  from a tetrahedron into an octahedron and back.
- An h slider (−2 to 2) moves the cut through the whole shape.
- The current slice is marked inside the shadow, so the two views can be compared.

## [0.1.0] - 2026-10-27

### Added

- Tesseract sandbox: the tesseract's perspective shadow (a cube inside a cube), drawn
  with plain WebGL2, edges tinted cool to warm by w.
- Six rotation sliders, one per plane (xy, xz, yz, xw, yw, zw), in radians and usable
  from the keyboard.
- The live 4×4 rotation matrix beside the view, with the order the sliders combine in.
