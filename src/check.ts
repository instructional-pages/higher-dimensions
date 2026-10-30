// Predict-then-reveal checks: the learner types a number for each prompt, or picks one of
// its choices, and can reveal the answers only once every prompt has one.

// A prompt answered with a typed number, or by picking one of `choices`.
export type Prompt = { label: string; answer: number } | { label: string; choices: string[]; answer: string };

// A typed prediction as a number, or null when it isn't one ("", "abc").
export function parseAnswer(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const x = Number(trimmed);
  return Number.isFinite(x) ? x : null;
}

// `value` is the typed text, or the picked choice ("" before one is picked).
const answered = (prompt: Prompt, value: string): boolean =>
  "choices" in prompt ? prompt.choices.includes(value) : parseAnswer(value) !== null;

export const canReveal = (prompts: Prompt[], values: string[]): boolean => prompts.every((p, k) => answered(p, values[k] ?? ""));

export const isRight = (prompt: Prompt, value: string): boolean =>
  "choices" in prompt ? value === prompt.answer : parseAnswer(value) === prompt.answer;
