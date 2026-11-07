# Acceptance log (append-only)

> One entry per /accept run. Revisit after three months against incident records: incidents in "not verified" items → tighten; long incident-free stretches → relax.

---

## YYYY-MM-DD · <task title>

- **diff:** `<base>...<head>`, N lines total, M critical-path lines
- **spec:** `<path>`, K "must be true" items

| Step | Status | Evidence |
|---|---|---|
| 1 Spec check | ✅/⚠️/❌ | x of K covered; list the "not found" ids |
| 2 Change map | ✅/❌ | number of 🔴 sites, critical-path lines |
| 3 Independent review | ✅/⚠️ | subagent reported n, agreed a, false positives b |
| 4 Spot check | ✅/❌ | three scenarios + file:line; user ruling correct/correct/correct |
| 5 Mutation check | ✅/❌ | injected: …; failing tests: …; tree restored |
| 6 Live run | ✅/⚠️ | scenarios and observed results |

- **Not verified:** (required; err on the side of listing more)
- **Return list:** ("none" if empty)
- **User ruling:** merge / return / merge with conditions (conditions: …)
- **Three-month review (YYYY-MM-DD):** any incident related to this change:
