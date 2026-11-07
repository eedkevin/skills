# Domain starter packs

The `/accept` protocol is domain-agnostic. Domain knowledge (invariants, high-risk scenarios) **lives in the target project** (default `docs/INVARIANTS.md`). This directory only holds starter templates to copy when a project creates its invariants file for the first time.

## Layout

```
domains/
└── <domain-slug>/
    ├── invariants.md     required: invariants list, ending with a "High-risk scenarios" section (step-4 priority)
    └── notes.md          optional: extra acceptance notes for this domain
```

`<domain-slug>` is lowercase with hyphens and describes a domain, not a project: `payments-stablecoin`, `alife-physics-sim`, `web-frontend`. One project maps to one domain; one domain may serve many projects.

## Adding a domain

1. Create `domains/<slug>/invariants.md`; copy the structure from an existing domain.
2. Write each invariant as a statement that **can be located in code and falsified by a test**, with source and date.
3. End with a "High-risk scenarios" section, ordered by danger, 3–7 items.
4. In the target project's `CLAUDE.md`, set `accept.domain: <slug>`. When the project has no invariants file, /accept will suggest copying from here.

## Existing domains

| slug | Covers | Status |
|---|---|---|
| `payments-stablecoin` | Stablecoin payments: ledger, idempotency, state machines, on-chain finality, reconciliation, compliance | Starter; items are industry-generic and must be replaced with this company's review findings |
