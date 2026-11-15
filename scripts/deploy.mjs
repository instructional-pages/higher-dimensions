// Builds the site and publishes dist/ to the gh-pages branch, from this machine (no
// Actions). The branch holds one commit, the latest build, replaced on every deploy.
//
//   npm run deploy                  build, check, and push to origin's gh-pages
//   npm run deploy -- --dry-run     build and prepare the commit, push nothing
//   npm run deploy -- --remote URL  push somewhere else (a local bare repo, to test)
//
// It refuses unless the tree is clean and HEAD is origin/main, so what goes live is
// exactly what passed local-ci and was merged.
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const remoteFlag = args.indexOf("--remote");
const BRANCH = "gh-pages";

const run = (cmd, cmdArgs, opts = {}) =>
  execFileSync(cmd, cmdArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...opts })?.trim() ?? "";
const git = (...a) => run("git", a);
const fail = (msg) => {
  console.error(`deploy: ${msg}`);
  process.exit(1);
};

process.chdir(join(import.meta.dirname, ".."));

if (git("status", "--porcelain")) fail("the working tree has changes; commit or stash them first.");
git("fetch", "--quiet", "origin", "main");
const head = git("rev-parse", "HEAD");
if (head !== git("rev-parse", "origin/main")) fail("HEAD is not origin/main; deploy from an up-to-date main.");

const remote = remoteFlag >= 0 ? args[remoteFlag + 1] : git("remote", "get-url", "origin");
if (!remote) fail("--remote needs a URL.");
const { version } = JSON.parse(readFileSync("package.json", "utf8"));

run("npm", ["run", "build"], { stdio: "inherit" });
run("npm", ["run", "size"], { stdio: "inherit" });

const work = mkdtempSync(join(tmpdir(), "hd-deploy-"));
try {
  cpSync("dist", work, { recursive: true });
  writeFileSync(join(work, ".nojekyll"), ""); // serve files as built, no Jekyll pass
  const w = (...a) => run("git", ["-C", work, ...a]);
  w("init", "--quiet", "--initial-branch", BRANCH);
  w("add", "--all");
  w("commit", "--quiet", "-m", `deploy ${version} from ${head.slice(0, 7)}`);
  console.log(w("show", "--stat", "--format=%s%n", "HEAD"));
  if (dryRun) {
    console.log(`deploy: dry run, nothing pushed (would force-push ${BRANCH} to ${remote}).`);
  } else {
    run("git", ["-C", work, "push", "--force", remote, `${BRANCH}:${BRANCH}`], { stdio: "inherit" });
    console.log(`deploy: pushed ${version} (${head.slice(0, 7)}) to ${BRANCH}.`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
