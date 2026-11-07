#!/usr/bin/env node
// Install every skill in this repo into Claude Code's skills directory.
//
//   npx github:eedkevin/skills                   symlink into ~/.claude/skills  (default target: claude)
//   npx github:eedkevin/skills --target codex    install for OpenAI Codex
//   npx github:eedkevin/skills --target all      install for every known tool
//   npx github:eedkevin/skills --copy            copy instead of symlink (for machines without the repo)
//   npx github:eedkevin/skills --project         install into the current project's skills dir instead of user-level
//   npx github:eedkevin/skills --list            show skills without installing
//
// A "skill" is any top-level directory containing SKILL.md (Agent Skills format, agentskills.io).
// Target paths below reflect each tool's convention as of this script's last update; verify against
// each tool's docs before relying on them, and edit TARGETS if they moved.

const fs = require("fs");
const os = require("os");
const path = require("path");

const argv = process.argv.slice(2);
const args = new Set(argv.filter((a) => a.startsWith("--")));
const targetArg = (() => {
  const i = argv.indexOf("--target");
  return i >= 0 && argv[i + 1] ? argv[i + 1] : "claude";
})();

// user-level and project-level skills directories per tool
const TARGETS = {
  claude:  { user: [".claude", "skills"],  project: [".claude", "skills"] },
  codex:   { user: [".agents", "skills"],  project: [".agents", "skills"] },
  copilot: { user: [".copilot", "skills"], project: [".github", "skills"] },
  cursor:  { user: [".cursor", "skills"],  project: [".cursor", "skills"] },
};

const toolNames = targetArg === "all" ? Object.keys(TARGETS) : targetArg.split(",");
for (const t of toolNames) {
  if (!TARGETS[t]) {
    console.error(`Unknown target "${t}". Known: ${Object.keys(TARGETS).join(", ")}, all`);
    process.exit(1);
  }
}

const repoRoot = path.resolve(__dirname, "..");
const mode = args.has("--copy") ? "copy" : "symlink";
const scope = args.has("--project") ? "project" : "user";
const baseDir = scope === "project" ? process.cwd() : os.homedir();

const skills = fs
  .readdirSync(repoRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "bin" && d.name !== "node_modules")
  .filter((d) => fs.existsSync(path.join(repoRoot, d.name, "SKILL.md")))
  .map((d) => d.name);

if (skills.length === 0) {
  console.error("No skills found (expected <dir>/SKILL.md at repo root).");
  process.exit(1);
}

if (args.has("--list")) {
  console.log(skills.join("\n"));
  process.exit(0);
}

let installed = 0;
for (const tool of toolNames) {
  const target = path.join(baseDir, ...TARGETS[tool][scope]);
  fs.mkdirSync(target, { recursive: true });

  for (const name of skills) {
    const src = path.join(repoRoot, name);
    const dst = path.join(target, name);

    if (fs.existsSync(dst) || isDanglingLink(dst)) {
      const st = fs.lstatSync(dst);
      if (st.isSymbolicLink() || mode === "copy") {
        fs.rmSync(dst, { recursive: true, force: true });
      } else {
        console.log(`skip    [${tool}] ${name}  (${dst} exists and is not a symlink; remove it to reinstall)`);
        continue;
      }
    }

    if (mode === "symlink") {
      fs.symlinkSync(src, dst, "dir");
      console.log(`linked  [${tool}] ${name}  -> ${dst}`);
    } else {
      fs.cpSync(src, dst, { recursive: true });
      console.log(`copied  [${tool}] ${name}  -> ${dst}`);
    }
    installed++;
  }
}

console.log(`\nDone. ${installed} install(s) for ${toolNames.join(", ")} (${scope}-level, ${mode}).`);
console.log("Restart the tool or start a new session to pick them up.");

function isDanglingLink(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}
