// Predict-then-reveal checks: the learner types a number for each prompt, and can reveal
// the answers only once every prompt has one.

// A typed prediction as a number, or null when it isn't one ("", "abc").
export function parseAnswer(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const x = Number(trimmed);
  return Number.isFinite(x) ? x : null;
}

export const canReveal = (texts: string[]): boolean => texts.every((t) => parseAnswer(t) !== null);

export const isRight = (text: string, answer: number): boolean => parseAnswer(text) === answer;
