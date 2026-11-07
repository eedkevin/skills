---
name: accept
description: Acceptance review for AI-implemented deliverables. Seven-step protocol - spec check, change map, independent review, edge-case spot check, mutation check, live run, acceptance log. Trigger on "accept", "验收", "can this be merged", "review this PR for acceptance". Produces evidence (file:line, test output) only; never decides for the user.
---

# /accept — Deliverable Acceptance Protocol v0.1

## Purpose

The user no longer hand-writes code. AI implements and tests. This skill lets the user build **evidence-based confidence** in code they did not write: confidence comes from a chain of evidence the user has seen with their own eyes, not from an AI saying "handled".

## Hard rules

1. **Implementer ≠ reviewer.** Step 3 must use a fresh reviewer (subagent or separate session) with **no implementation context**, given only the invariants file and the diff.
2. **Evidence only, no verdicts.** Every claim carries a `file:line` or test output. If not found, write "not found". Never fabricate.
3. **One failed spot check returns the whole deliverable.** Do not patch the one spot; rerun steps 1–4 on the whole change.
4. **The user reads.** Code locations in step 4 are for the user to read by hand. This skill never declares "pass" on the user's behalf.
5. **Mutation check must be reversible.** The injected bug is reverted within the same step, and the working tree is shown clean to the user.
6. **Never accept a diff you cannot read.** Critical-path changes (money, state) above the limit are returned for splitting.

## Inputs and configuration

Defaults below can be overridden in the project's `CLAUDE.md` or `.claude/accept.md`:

| Key | Default | Notes |
|---|---|---|
| `spec` | The spec file the user names, or the most recent "what must be true when done" list in the conversation | No spec → ask the user for 3–5 lines first. Do not start without one |
| `invariants` | `docs/INVARIANTS.md` | The project's domain invariants file; must end with a "High-risk scenarios" section. If missing, use `domain` to suggest copying `references/domains/<domain>/invariants.md`, then continue in spec-only mode |
| `domain` | none | Domain slug, see `references/domains/README.md`. Only used to locate a starter template; the protocol itself is domain-agnostic |
| `diff` | `git diff <base>...HEAD`, base defaults to `main` | May also be a PR number or a file list |
| `critical_diff_limit` | 400 lines | Upper bound for critical-path diff |
| `log` | `docs/ACCEPTANCE_LOG.md` | Append-only acceptance log, format in `references/acceptance-log-template.md` |
| `test_cmd` | Inferred from Makefile / package.json / pyproject | Test command used in step 5 |

## The seven steps

### Step 1 · Spec check
Read the spec. For each "must be true" item, locate where the diff implements it. Output a table:

| # | Must be true | Location | Status |
|---|---|---|---|
| 1 | … | `path/file.py:123` | covered / partial / not found |

Every "not found" goes straight onto the return list.

### Step 2 · Change map
Output: files changed; key functions per file; mark with 🔴 every place that **writes the ledger / changes money state / calls an external service / changes permissions**; count critical-path lines. Above `critical_diff_limit` → stop, propose how to split, end this acceptance.

### Step 3 · Independent review
Start an independent reviewer with no memory of this session: in Claude Code, a fresh general-purpose subagent via the Agent tool; in Codex, Copilot or Cursor, a new agent or chat session. Its prompt contains **only**: the full invariants file, the full diff, and this task: "Check the diff line by line against every invariant. List each violation with file:line and reasoning. Do not add the implementer's explanations. If you find no violation, say so." Do not pass this session's implementation discussion, plan, or rationale. Relay its findings verbatim, then mark which you agree with and which you consider false positives (with reasons).

### Step 4 · Edge-case spot check (user reads by hand)
From the invariants file's "High-risk scenarios" section and the spec, pick the **three most dangerous edge cases** (priority comes from the invariants file; this skill presets no domain). For each:
- State the scenario
- Point to the **exact code line** that handles it (`file:line`, with a 5–10 line snippet)
- Point to the test covering it (`file:line`), or write "no test"

Then explicitly ask the user to read each one and reply "correct / incorrect". Any "incorrect" triggers hard rule 3.

### Step 5 · Mutation check
Pick one location related to a step-4 edge case and describe the bug to inject (e.g. remove the idempotency-key check / change `>=` to `>` / delete the rollback branch). Procedure:
1. `git stash` or apply on a temporary branch
2. Run `test_cmd`
3. Record which tests fail; **no failing test = the tests are decorative**, add to the return list
4. Revert, then run `git status` / `git diff --stat` to show the user the working tree is clean

### Step 6 · Live run
List 2–3 edge scenarios the user can trigger in a test environment (input, action, expected observable result). Run headless ones and paste output; hand the rest to the user and wait for their report.

### Step 7 · Acceptance log
Append one entry to `log` using `references/acceptance-log-template.md`: date, task, what was verified (per step), **what was not verified**, return list, final user ruling (filled by the user). Revisit after three months against incident records to calibrate thresholds.

## Output format

One section per step, each opening with a status line: `✅ pass` / `⚠️ awaiting user ruling` / `❌ returned`. End with the **return list** (may be empty) and one sentence: how many pieces of evidence the user has personally seen in this acceptance.

## Out of scope

- Fixing bugs. Findings go on the return list; the implementation flow fixes them.
- Judging "good enough" for the user.
- Starting without a spec.
