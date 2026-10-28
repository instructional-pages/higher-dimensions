// The lesson shell: a lesson's views on the left (one main, the others small and
// swappable), and beside them its short text steps, advanced with Back and Next. A step
// may hold a predict-then-reveal check, which must be revealed before Next. The lesson
// itself draws the views and puts each step's sliders in place.

import { canReveal, isRight } from "./check.ts";
import { figure, linkViews, type ViewSpec } from "./ui.ts";

export interface Check {
  // One typed number per prompt, e.g. "4D".
  prompts: { label: string; answer: number }[];
  // Shown on reveal, HTML.
  after: string;
}

export interface Step {
  // HTML.
  text: string;
  check?: Check;
}

export interface Lesson {
  title: string;
  // The first is the main view.
  views: ViewSpec[];
  steps: Step[];
  // Starts drawing into the lesson's figures. `show` sets up step i, putting its
  // sliders in `controls`; `stop` ends drawing. Null when the browser has no WebGL2.
  start(figures: HTMLElement[], controls: HTMLElement): { show(step: number): void; stop(): void } | null;
}

// Builds lesson `n` into `root`; the returned function stops it. `next` is the hash the
// last step's button leads to.
export function mountLesson(root: HTMLElement, n: number, lesson: Lesson, next: string): () => void {
  const views = Object.assign(document.createElement("div"), { className: "views" });
  const figures = lesson.views.map(figure);
  views.append(...figures);
  const aside = document.createElement("aside");
  aside.innerHTML = `
    <a class="up" href="#">Contents</a>
    <h1></h1>
    <p class="note counter"></p>
    <div class="text"></div>
    <div class="check"></div>
    <div class="sliders"></div>
    <nav><button type="button">Back</button><button type="button">Next</button></nav>`;
  root.append(views, aside);
  linkViews(views);

  const $ = (selector: string) => aside.querySelector<HTMLElement>(selector)!;
  $("h1").textContent = lesson.title;
  const [back, forward] = aside.querySelectorAll("button");
  const scene = lesson.start(figures, $(".sliders"));
  if (!scene) {
    $(".text").textContent = "This browser has no WebGL2, which the lessons need.";
    aside.querySelector("nav")!.remove();
    return () => {};
  }

  let at = 0;
  // Checks already revealed don't hold Next back again on a second visit.
  const revealed = new Set<number>();
  const show = (i: number) => {
    at = i;
    const step = lesson.steps[i]!;
    const last = i === lesson.steps.length - 1;
    $(".counter").textContent = `Lesson ${n} · ${i + 1} of ${lesson.steps.length}`;
    $(".text").innerHTML = step.text;
    back!.disabled = i === 0;
    forward!.textContent = last ? (next === "" ? "Contents" : "Next lesson") : "Next";
    forward!.disabled = !!step.check && !revealed.has(i);
    $(".sliders").replaceChildren();
    showCheck($(".check"), step.check, () => (revealed.add(i), (forward!.disabled = false)));
    scene.show(i);
  };
  back!.addEventListener("click", () => show(at - 1));
  forward!.addEventListener("click", () => {
    if (at < lesson.steps.length - 1) show(at + 1);
    else location.hash = next;
  });
  show(0);
  return scene.stop;
}

// Fills `box` with the check's prompts and a Reveal button, enabled once every prompt
// has a number. Revealing marks each prediction and calls `revealed`.
function showCheck(box: HTMLElement, check: Check | undefined, revealed: () => void) {
  box.replaceChildren();
  if (!check) return;
  const inputs = check.prompts.map(({ label }) => {
    const row = document.createElement("label");
    const input = Object.assign(document.createElement("input"), { type: "text", inputMode: "decimal", autocomplete: "off" });
    row.append(label, input, document.createElement("output"));
    box.append(row);
    return input;
  });
  const reveal = Object.assign(document.createElement("button"), { type: "button", textContent: "Reveal", disabled: true });
  const after = Object.assign(document.createElement("p"), { innerHTML: check.after, hidden: true });
  box.append(reveal, after);
  for (const input of inputs) input.addEventListener("input", () => (reveal.disabled = !canReveal(inputs.map((i) => i.value))));
  reveal.addEventListener("click", () => {
    check.prompts.forEach(({ answer }, k) => {
      const input = inputs[k]!;
      const right = isRight(input.value, answer);
      input.readOnly = true;
      input.nextElementSibling!.textContent = right ? "right" : `it's ${answer}`;
      input.parentElement!.classList.add(right ? "right" : "wrong");
    });
    reveal.remove();
    after.hidden = false;
    revealed();
  });
}
