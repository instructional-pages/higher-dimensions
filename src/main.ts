// Entry point. The renderer and lessons arrive in later PRs; for now this only
// checks that the browser can run them.
const status = document.getElementById("status");
if (status && !document.createElement("canvas").getContext("webgl2")) {
  status.textContent = "This browser has no WebGL2, which the lessons need.";
}
