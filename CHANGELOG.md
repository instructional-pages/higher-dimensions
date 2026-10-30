# Changelog

All notable changes are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [0.9.0] - 2026-10-30

### Added

- Lesson 5, "Turning in a plane": why a turn needs a plane (a segment on its line can only
  flip), then the square turning about its corner (0, 0) by θ in the xy plane, on a radian
  slider that lands exactly on each eighth of a turn. Predict where (1, 0) goes at π/2,
  follow it to meet cos θ and sin θ, build x′ = cos θ·x − sin θ·y, y′ = sin θ·x + cos θ·y
  from the corners (1, 0) and (0, 1), then multiply the 2×2 matrix by a corner's column
  one row at a time. Ends in a sandbox with the live matrix and every corner's turned
  coordinates.

## [0.8.0] - 2026-10-30

### Added

- Lesson 4, "Squares, cubes and beyond": the same rule counts pieces of every size. On
  each rung, the old copy, the new copy and the swept pieces now fill a row of corners,
  edges, squares and cubes (4D: 6 + 6 + 12 = 24 squares, 1 + 1 + 6 = 8 cubes), and the
  swept squares are filled in the picture. Predict the tesseract's squares and cubes, then
  a 5D cube's corners, edges and squares with no picture, which leads to the closed form
  C(n, k)·2ⁿ⁻ᵏ. Ends in a sandbox that steps through the tesseract's 8 cubes.

### Changed

- Check labels get as much room as the longest one needs, so "4D corners" no longer wraps.

## [0.7.1] - 2026-10-28

### Changed

- The course is now called "Higher Dimensions" (was "Higher Dimensions Explorer"), and the
  repo is `instructional-pages/higher-dimensions`.

## [0.7.0] - 2026-10-28

### Added

- Lesson 3, "Counting corners and edges": extrusion tells you how to count. On each rung
  from 1D to 4D, light up the old copy, the new copy and the connecting edges one at a
  time; each adds its corners and edges to that rung's row of the count table, as a sum
  (4D: 8 + 8 = 16 corners, 12 + 12 + 8 = 32 edges). The rest of the shape fades while a
  group is lit. Predict the tesseract's row before counting it, then the corners of a 10D
  cube, which leads to V(n) = 2ⁿ. Ends in a sandbox where you pick the rung.

## [0.6.0] - 2026-10-28

### Added

- Lesson 2, "Building by extrusion": every cube is the one below it, dragged along a new
  direction. A slider drags a copy of the shape out along each new axis in turn, from a
  point to a segment, a square, a cube and, along w, the tesseract. The old copy is dim,
  the new copy bright, and the edges joining them dashed. Every corner shows its
  coordinates, all 0s and 1s once the copy is out, and a table lists both copies' corners.
  Before the tesseract, predict how many corners it will have. Ends in a sandbox where
  you pick the rung.

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
