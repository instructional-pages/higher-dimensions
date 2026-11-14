// A slice as a small SVG drawing, for lesson 10's picked pictures: the Slice view's
// camera, its faces filled and shaded the same way, drawn far to near so nearer faces
// sit on top. Every thumbnail uses one camera and scale, so sizes compare.

import { camera, cameraDirection, css, faceAlpha, tint, toScreen } from "./render.ts";
import { cross, dot, type Slice } from "./slice.ts";
import type { Vec3 } from "./math4d.ts";

export const WIDTH = 120;
export const HEIGHT = 90;
// Nearer than the Slice view's 11, so a 2.8-long box nearly fills the picture.
const DISTANCE = 6;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const fixed1 = (x: number) => (Math.round(x * 10) / 10).toString();

// `cut` tinted by its w = h, with `title` read out in place of the picture.
export function thumbnail(cut: Slice, h: number, title: string): string {
  const view = camera(WIDTH / HEIGHT, DISTANCE);
  const toCamera = cameraDirection();
  const color = css(tint(h));
  const depth = (face: number[]) => face.reduce((d, i) => d + dot(cut.points[i]!, toCamera), 0) / face.length;
  const polygons = [...cut.faces]
    .sort((a, b) => depth(a) - depth(b))
    .map((face) => {
      const [p, q, r] = face.map((i) => cut.points[i]!) as [Vec3, Vec3, Vec3];
      const points = face.map((i) => toScreen(view, cut.points[i]!, WIDTH, HEIGHT).map(fixed1).join(",")).join(" ");
      return `<polygon points="${points}" fill-opacity="${faceAlpha(cross(sub(q, p), sub(r, p))).toFixed(2)}"/>`;
    });
  return (
    `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round">` +
    `<title>${title}</title>${polygons.join("")}</svg>`
  );
}
