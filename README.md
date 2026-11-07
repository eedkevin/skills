# skills

Personal Claude Code skills. One skill per subdirectory; the directory name is the skill name and `SKILL.md` is the entry point.

## Install

**With npx (recommended, works on a fresh machine):**

```bash
npx github:eedkevin/skills                    # Claude Code, user-level (~/.claude/skills)
npx github:eedkevin/skills --target codex     # OpenAI Codex
npx github:eedkevin/skills --target copilot   # GitHub Copilot
npx github:eedkevin/skills --target cursor    # Cursor
npx github:eedkevin/skills --target all       # every tool above
npx github:eedkevin/skills --project          # project-level dir of the current repo instead of user-level
npx github:eedkevin/skills --copy             # copy instead of symlink
npx github:eedkevin/skills --list             # show available skills
```

npx clones the repo into its cache and runs `bin/install.js`. With the default symlink mode the skills point into that cache, so rerun the command to update. To track your own clone instead, clone the repo and run `node bin/install.js` from inside it.

**Cross-tool compatibility.** Skills follow the open Agent Skills format (`SKILL.md` with `name`/`description` frontmatter plus a `references/` folder), which Claude Code, Codex, Copilot and Cursor all read. The installer places the same directory at each tool's lookup path:

| Tool | User-level | Project-level |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Codex | `~/.agents/skills/` | `.agents/skills/` |
| Copilot | `~/.copilot/skills/` | `.github/skills/` |
| Cursor | `~/.cursor/skills/` | `.cursor/skills/` |

These paths are the conventions as of this repo's last update; they change often, so verify against each tool's docs and edit `TARGETS` in `bin/install.js` if one moved. For a tool version that only reads `AGENTS.md` or `.github/copilot-instructions.md`, add a line there pointing at the skill, e.g. `For acceptance reviews follow .agents/skills/accept/SKILL.md`.

Keep skill bodies tool-neutral: name a tool-specific feature (such as Claude Code's Agent tool) only as one option alongside the generic action.

**Manually:**

```bash
git clone git@github.com:eedkevin/skills.git ~/projects/skills
mkdir -p ~/.claude/skills
ln -s ~/projects/skills/accept ~/.claude/skills/accept
```

## Skills

| Skill | Purpose | Version |
|---|---|---|
| `/accept` | Seven-step acceptance protocol for AI-implemented deliverables: spec check, change map, independent review, edge-case spot check, mutation check, live run, acceptance log | v0.1 |

## Layout convention

```
<skill>/
├── SKILL.md                      the protocol, domain-agnostic
└── references/
    ├── <shared-template>.md      shared across domains (e.g. acceptance log format)
    └── domains/<domain-slug>/    domain starter packs, see accept/references/domains/README.md
```

Skills hold process only. Domain knowledge lives in `references/domains/<slug>/`, and the live invariants file lives in the target project at `docs/INVARIANTS.md`.

## Before using /accept

1. Create `docs/INVARIANTS.md` in the target project, starting from `accept/references/domains/<slug>/invariants.md` (currently `payments-stablecoin`); keep appending from review comments and incident records. Set `accept.domain: <slug>` in the project's `CLAUDE.md`.
2. Before each task, write 3–5 lines of "what must be true when done" and save them as a spec file; /accept uses it as the acceptance basis.
3. Acceptance records append to the target project's `docs/ACCEPTANCE_LOG.md` by default.

## License

MIT, see `LICENSE`.
