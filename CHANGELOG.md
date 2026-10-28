# Changelog

All notable changes are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

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
