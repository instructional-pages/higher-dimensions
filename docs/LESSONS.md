# Lesson outline

Approved 2026-10-27. Twelve lessons on a dimension ladder: each takes one idea and climbs
0D → 1D → 2D → 3D → 4D with it. Every lesson is a few short text steps beside the live
view (Next button), at least one predict-then-reveal check, and a sandbox at the end.

Reader: a beginner who knows 3D well and has little linear algebra. Vectors and matrices
are introduced only when a lesson needs them, and always next to the picture they
describe.

## At a glance

| # | Lesson | Main view | Small views | Rotation sliders available |
|---|--------|-----------|-------------|-----------------------------|
| 1 | Where is a point? | Projection | Coordinates | none |
| 2 | Building by extrusion | Projection | Coordinates | none |
| 3 | Counting corners and edges | Projection | Count table | none |
| 4 | Squares, cubes and beyond | Projection | Count table | none |
| 5 | Turning in a plane | Projection (2D) | Matrix | **xy** |
| 6 | Planes, not axes | Projection (3D) | Matrix | xy, **xz, yz** |
| 7 | Shadows | Projection | Matrix | xy, xz, yz |
| 8 | Turning into w | Projection | Matrix | …, **xw**, then **yw, zw** (all 6) |
| 9 | Slicing | Slice | Projection | xy, xz, yz |
| 10 | Slicing a turning shape | Slice | Projection, Matrix | all 6 |
| 11 | Unfolding | Net | Projection | xy, xz, yz |
| 12 | Everything linked | Learner's choice | all others | all 6 |

New sliders are in **bold**. The three planes that keep w fixed (xy, xz, yz) only turn
the shape the way a 3D object turns; the three that mix in w (xw, yw, zw) are the new
4D motion. The 4D planes arrive in lesson 8, one first (xw), then the other two.

## 1. Where is a point?

**Idea:** a dimension is one more independent direction, so one more number to say where
you are. A point in nD is a list of n numbers: a *vector*.

**Ladder:**
- 0D: a single point. No numbers needed; there is nowhere else to be.
- 1D: a line. One number, x.
- 2D: a plane. Two numbers, (x, y).
- 3D: space. Three numbers, (x, y, z).
- 4D: four numbers, (x, y, z, w). w is a fourth direction at right angles to the other
  three. We can't point to it, but we can compute with it; the color shows it (cool for
  low w, warm for high w).

**Steps:** the point moves along each new axis in turn; the coordinate column grows by one
entry per rung. Introduces the w color scale used everywhere after.

**Check:** "How many numbers do you need to place a point in 4D? In 7D?" (4, 7.)

**Sandbox:** four sliders for x, y, z, w moving one point; its coordinate column and color
update live.

## 2. Building by extrusion

**Idea:** every cube is the one below it, dragged along a new direction. Copy the shape,
push the copy one unit along the new axis, connect each corner to its copy.

**Ladder:** point → segment → square → cube → tesseract. Corners are shown with their
coordinates (all 0s and 1s), so a cube's corners are every list of n zeros and ones.

**Steps:** an extrusion slider (0 to 1) drags the copy out at each rung. At 4D the copy
moves along w: it is the same cube, but warm-colored, and in projection it sits around
the original (nearer in w looks bigger). Old copy, new copy and connecting edges are told
apart by brightness and dashes (dim, bright, dashed), so the w tint keeps its meaning.

**Check:** before the tesseract is extruded, "how many corners will it have?" (16).

**Sandbox:** pick a rung (0D–4D) and drag the extrusion slider.

## 3. Counting corners and edges

**Idea:** extrusion tells you how to count. Corners double; edges are the two copies'
edges plus one new edge per old corner.

**Ladder:** a table filled in one row at a time, 0D → 4D:

| n | corners V(n) = 2·V(n−1) | edges E(n) = 2·E(n−1) + V(n−1) |
|---|---|---|
| 0 | 1 | 0 |
| 1 | 2 | 1 |
| 2 | 4 | 4 |
| 3 | 8 | 12 |
| 4 | 16 | 32 |

**Steps:** for each rung, highlight the old copy, the new copy, then the connecting edges,
and add each group to the running count.

**Check:** predict every 4D cell before it fills in (16 corners, 32 edges). Then the
shortcut: V(n) = 2ⁿ.

**Sandbox:** click a highlight group (old / new / connecting) on the tesseract to count it.

## 4. Squares, cubes and beyond

**Idea:** the same rule counts pieces of every size. A k-dimensional piece of the new
shape is either a k-piece of one of the two copies, or a (k−1)-piece swept along the new
direction: F(n, k) = 2·F(n−1, k) + F(n−1, k−1).

**Ladder:** extend the table with squares (k = 2) and cubes (k = 3): the cube has 6
squares; the tesseract has 24 squares and 8 cubes.

**Steps:** highlight the swept pieces at each rung. End with the closed form: choose which
k of the n directions the piece spans, C(n, k) ways, then which side it sits on in each
of the other n − k directions, 2ⁿ⁻ᵏ ways: F(n, k) = C(n, k)·2ⁿ⁻ᵏ.

**Check:** predict the tesseract's squares (24) and cubes (8); then, with no picture,
predict a 5D cube's corners, edges and squares (32, 80, 80).

**Sandbox:** step through the tesseract's 8 cubes, one highlighted at a time.

## 5. Turning in a plane

**Idea:** a rotation turns one direction toward another. It happens in a *plane*, and the
new coordinates are a fixed mix of the old ones: a matrix.

**Ladder:**
- 0D, 1D: nothing to turn (in 1D you can only flip, which is not a turn).
- 2D: one plane, xy. The square turns by an angle θ in radians.

**Steps:** follow one corner: x′ = cos θ·x − sin θ·y, y′ = sin θ·x + cos θ·y. Then write
the same thing as a 2×2 matrix times the coordinate column, and show what a matrix times a
vector means (each new coordinate is a row times the column). Introduce radians on the
slider (π/2 is a quarter turn).

**Check:** "at θ = π/2, where does the corner (1, 0) go?" ((0, 1).)

**Sandbox:** the **xy** slider with the live 2×2 matrix and each corner's coordinates.

## 6. Planes, not axes

**Idea:** in 3D we say "rotate around an axis", but the axis is just what's left over: the
rotation itself happens in a plane. 3D has three planes, xy, xz, yz.

**Ladder:** count the planes, one per pair of directions: 0D 0, 1D 0, 2D 1, 3D 3, 4D 6.
In 3D each plane leaves one axis still; in 4D a plane leaves a whole *plane* still (xy
rotation leaves z and w alone), which is why "around an axis" stops working.

**Steps:** each 3D rotation matrix is the 2D matrix from lesson 5 placed in two rows and
two columns of the 3×3 identity. Turning several sliders multiplies the matrices, in the
fixed order the matrix panel shows. Then why the order matters: rotations in different
planes don't commute. Follow the corner (1, 0, 0) through xy by π/2 then xz by π/2: it
ends at (0, 1, 0). Swap the order, xz first, then xy: it ends at (0, 0, 1). A swap-order
toggle shows both results side by side, and the two matrix products differ. The sliders
always use the panel's fixed order, so the learner can read the result off the matrix.

**Check:** "how many rotation planes does 4D have?" (6), then "which coordinates does the
xz rotation leave unchanged?" (y). Then: "xy by π/2 then xz by π/2, or the other way
round: does the cube end up the same?" (no: the corner (1, 0, 0) lands on (0, 1, 0) one
way and (0, 0, 1) the other.)

**Sandbox:** the cube with **xy, xz, yz** and the 3×3 matrix.

## 7. Shadows

**Idea:** to see a shape from one dimension up, look at its shadow (projection) one
dimension down. We already do this every time we look at a 3D drawing on a flat screen.

**Ladder:**
- 1D → 0D: a segment's shadow on a point is a point.
- 2D → 1D: a square's shadow on a line is a segment, longer or shorter as it turns.
- 3D → 2D: a cube's shadow. Straight-on shadow (drop z) vs. perspective (nearer is
  bigger): face-on, perspective shows a square inside a square.
- 4D → 3D: the tesseract's perspective shadow along w is a cube inside a cube; the inner
  cube is the far (cool) one. The 3D shadow is then drawn on the screen like any 3D
  object.

**Steps:** the perspective formula is one division: scale by d / (d − w) for a viewer at
distance d along w. Point out what a shadow distorts: all 32 edges are equally long, and
the 8 cubes are all identical, even though most look like squashed boxes.

**Check:** before the 4D shadow appears, "the cube face-on looked like a square inside a
square. What will the tesseract look like?" (a cube inside a cube.)

**Sandbox:** the tesseract shadow with **xy, xz, yz** (turning the shadow as a 3D object).

## 8. Turning into w

**Idea:** the new motion. Rotating in a plane that contains w swaps a direction we can see
with one we can't, so in the shadow the shape seems to turn inside out.

**Ladder:** 2D square turning in xy, seen only as its 1D shadow on the x axis (the shadow
shrinks, flips, grows); 3D cube turning in xz, seen only as its 2D shadow on the xy plane
(faces slide past each other); 4D tesseract turning in xw, seen as its 3D shadow (the
inner cube grows and passes through the outer one). Each time, the lower-dimensional
viewer sees what we see in 4D.

**Steps:** introduce **xw** alone first, then **yw** and **zw**. The 4×4 matrix is again
the 2×2 block from lesson 5, now with w in it. Colors move cool ↔ warm as corners trade
w for x.

**Check:** "turn xw by π/2. Which cube ends up on the outside?" (the one that faced +x.)
Then: "after a full turn of 2π, where is everything?" (back where it started.)

**Sandbox:** all **six sliders** with the live 4×4 matrix.

## 9. Slicing

**Idea:** the other way to see a shape one dimension up: cut it with a flat cut one
dimension down and look at the cut.

**Ladder:**
- 1D segment cut by a point: a point (or nothing).
- 2D square cut by a line: a segment.
- 3D cube cut by a plane: straight-on, a square. Corner-first, a triangle that grows into
  a hexagon at the middle, then shrinks back.
- 4D tesseract cut by a 3D "plane" (w = constant): straight-on, a cube that appears, stays
  the same, and disappears. Corner-first, a tetrahedron that grows into an octahedron at
  the middle (the 4D analog of the hexagon), then shrinks back.

**Steps:** a slider moves the cut along the last axis. Slices are filled. The slice view
appears here for the first time. A Flatlander
can only see the slices of a passing cube; we are in the same position with the
tesseract.

**Check:** the cube corner-first: "what shape is the middle slice?" (hexagon). Then the
tesseract corner-first: "what is the middle slice?" (octahedron).

**Sandbox:** the cut position slider plus **xy, xz, yz** (these only turn the slice
rigidly, since they don't change w). Presets for straight-on, edge-first and corner-first.

## 10. Slicing a turning shape

**Idea:** this is the main goal: predict what a slice does next while the shape turns.
The rule: the slice changes only through the rotations that mix in w.

**Ladder:** the 3D cube turning in xz while cut by the fixed plane z = 0 (the square slice
stretches into a longer rectangle, widest at π/4, then shrinks back to a square); then the
tesseract turning in xw while cut at w = 0 (the cube slice stretches into a longer box
along x, the same way). Turning in a second plane as well tilts the cut against the
shape, and the slice gains new faces (the hexagons and octahedra of lesson 9). The linked projection
shows the whole shape, the slice shows the cut.

**Steps:** first show that xy, xz, yz only turn the slice; then turn xw in small steps,
pausing after each so the learner can guess. Then yw and zw, which do the same along y
and z.

**Check:** several predict-then-reveal rounds: the slice is shown at one angle, the learner
picks the next slice (out of three pictures) for a small further turn, then it is revealed.

**Sandbox:** **all six sliders** plus the cut position.

## 11. Unfolding

**Idea:** a shape's boundary can be cut open and laid flat one dimension down: its net.
Folding it back up shows how the pieces join.

**Ladder:**
- 2D square → 4 segments in a line, folding up into the square.
- 3D cube → 6 squares in a cross, folding up into the cube.
- 4D tesseract → 8 cubes in a 3D cross (a column of 4 with one cube on each of the 4 side
  faces of the second cube), folding up "into" 4D. Mid-fold, the cubes leave our space.

**Steps:** the fold slider (0–100%, no autoplay) at each rung. Pairs of opposite pieces
share a color. In 4D every square face of every cube is glued to exactly one other cube.

**Check:** "how many cubes does the tesseract's net have?" (8). Then: "which cube in the
net is opposite the top one?" (the third in the column: the column wraps around like the
cube's row of four squares, where the top square is opposite the third.)

**Sandbox:** the tesseract net with the fold slider and **xy, xz, yz** to look around it.

## 12. Everything linked

**Idea:** projection, slice and net are three views of the same object; they move together.

**Ladder:** a short recap, one screen per rung, of the three views of the square, the
cube and the tesseract side by side.

**Steps:** the learner picks the main view; the others shrink beside it. Turning any
slider updates all of them, the matrix and the coordinates.

**Check:** mixed final round. Predict the next slice under xw (criterion 1). With no
picture: derive the 5D cube's corners, edges, squares, cubes and 4D cells (32, 80, 80,
40, 10) and the 6D cube's edges (192) (criterion 2).

**Sandbox:** the full tesseract sandbox: all views, all six sliders, cut position and fold.

## Success criteria coverage

| Criterion | Where it is taught | Where it is checked |
|-----------|--------------------|---------------------|
| Predict what the 3D slice does next under a 4D rotation | 8 (4D turns), 9 (slices), 10 (both) | 10 (repeated rounds), 12 |
| Derive the n-cube's vertex, edge and face counts | 2 (extrusion), 3 (V, E), 4 (all k, closed form) | 3, 4 (5D with no picture), 12 (5D and 6D) |
| 60 fps with all linked views | Not a lesson matter: renderer work | — |
| A newcomer finishes the 4D lessons without help | Every lesson: each needed idea (vectors, matrices, radians, projection formula) is taught where it is first used | Usability check once lessons exist |

## Settled in review

- **Projection along w is perspective** (cube in a cube), not straight-on, which would
  collapse the two cubes on top of each other.
- **Rotation order:** sliders combine in one fixed order, shown in the matrix panel, and
  lesson 6 teaches that rotations in different planes don't commute.
- **5D and 6D appear only as counts** (lessons 4 and 12), never drawn, so the MVP renderer
  stays 4D-only.
- **The slice view first appears in lesson 9**, where slices are taught; lesson 8 doesn't
  show it.
