// Which page a URL hash names: "#3" is lesson 3, "#sandbox" the tesseract sandbox, and
// anything else (no hash, or a lesson that isn't built yet) the contents.

export type Route = { page: "contents" } | { page: "sandbox" } | { page: "lesson"; n: number };

// `built` is how many lessons exist, numbered from 1.
export function parseRoute(hash: string, built: number): Route {
  const name = hash.replace(/^#/, "");
  if (name === "sandbox") return { page: "sandbox" };
  if (/^[1-9]\d*$/.test(name) && Number(name) <= built) return { page: "lesson", n: Number(name) };
  return { page: "contents" };
}
