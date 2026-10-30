// The course as one page: the URL hash picks the contents, a lesson (#1) or the
// sandbox (#sandbox), and each change rebuilds the page from scratch. Nothing is saved.

import { mountLesson, type Lesson } from "./lesson.ts";
import { lesson1 } from "./lesson1.ts";
import { lesson2 } from "./lesson2.ts";
import { lesson3 } from "./lesson3.ts";
import { lesson4 } from "./lesson4.ts";
import { parseRoute } from "./route.ts";
import { mountSandbox } from "./sandbox.ts";

const TITLES = [
  "Where is a point?",
  "Building by extrusion",
  "Counting corners and edges",
  "Squares, cubes and beyond",
  "Turning in a plane",
  "Planes, not axes",
  "Shadows",
  "Turning into w",
  "Slicing",
  "Slicing a turning shape",
  "Unfolding",
  "Everything linked",
];
// The lessons built so far, in order.
const LESSONS: Lesson[] = [lesson1, lesson2, lesson3, lesson4];
const COURSE = "Higher Dimensions";

const root = document.querySelector("main")!;
let stop = () => {};

function mountContents(root: HTMLElement) {
  root.innerHTML = `
    <div class="contents">
      <h1>${COURSE}</h1>
      <p class="note">How a fourth direction works, built up from the ones you know. Each
        lesson climbs from 0D to 4D with one idea and ends in a sandbox.</p>
      <ol>${TITLES.map((title, i) => (i < LESSONS.length ? `<li><a href="#${i + 1}">${title}</a></li>` : `<li class="later">${title}</li>`)).join("")}</ol>
      <p><a href="#sandbox">The tesseract sandbox</a>: every view and slider at once.</p>
    </div>`;
  return () => {};
}

function render() {
  stop();
  // Free the old page's WebGL contexts now rather than whenever they're collected.
  for (const canvas of root.querySelectorAll("canvas")) canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  root.replaceChildren();
  root.className = "";
  const route = parseRoute(location.hash, LESSONS.length);
  if (route.page === "lesson") {
    const lesson = LESSONS[route.n - 1]!;
    document.title = `${lesson.title} · ${COURSE}`;
    stop = mountLesson(root, route.n, lesson, route.n < LESSONS.length ? `#${route.n + 1}` : "");
  } else if (route.page === "sandbox") {
    document.title = `The tesseract · ${COURSE}`;
    stop = mountSandbox(root);
  } else {
    document.title = COURSE;
    root.className = "page";
    stop = mountContents(root);
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
