# Domain invariants (template) — stablecoin payments

> Purpose: ammunition for /accept steps 3 and 4. One line each, written as a statement that **can be located in code and falsified by a test**.
> Sources: code-review comments received, incident and hotfix records, senior colleagues' "top ten ways this system breaks".
> Tag each item with source and date; mark uncertain ones with `?`.

## 1. Money and ledger
- [ ] Amounts use fixed-point / integer minor units; floating point is forbidden. (source:     date:     )
- [ ] Every ledger write is double-entry; debits equal credits.
- [ ] The ledger is append-only; history is never modified or deleted. Corrections are reversing entries.
- [ ] User-visible balance = ledger aggregate; no separately maintained balance field that can drift.

## 2. Idempotency and duplicates
- [ ] Every externally triggerable write has an idempotency key; a replay with the same key returns the first result and produces no second effect.
- [ ] Callbacks (on-chain confirmations, third-party notifications) may arrive out of order, duplicated, or late; handlers are insensitive to this.

## 3. State machines
- [ ] Each money object (deposit / withdrawal / transfer / freeze) has exactly one table of legal transitions; code cannot bypass it.
- [ ] Terminal states never change; any transition out of a terminal state is a bug.
- [ ] Partial failure (debited but not broadcast / broadcast but not booked) has an explicit intermediate state and a compensation path.

## 4. On-chain and finality
- [ ] Deposits are booked only after the chain's configured confirmation count; the count is configuration, not a constant.
- [ ] A chain reorg can revoke a booked deposit; the system has a corresponding revocation path.
- [ ] Nonces / sequence numbers are owned by a single writer; concurrent sends are serialized.

## 5. Reconciliation
- [ ] Internal ledger, on-chain balances, and third-party statements are reconciled daily; discrepancies raise alerts, never silence.
- [ ] Every manual adjustment entry carries a ticket id and an operator.

## 6. Compliance and permissions
- [ ] Freeze / unfreeze / blocklist logic exists in one module; other modules call it and never copy it.
- [ ] Fields required by Travel Rule / KYC are mandatory on the withdrawal path, not optional.

## 7. Project-specific (append continuously from review comments)
- [ ]

## 8. High-risk scenarios (/accept step 4 picks from here, in order)
1. Same request submitted twice / callback delivered twice
2. Partial failure: debited but not broadcast, broadcast but not booked, third-party succeeds after timeout
3. Amount boundaries: zero, one minor unit, precision truncation, over limit
4. Concurrency: two withdrawals from one account at once, nonce races
5. Late callbacks, out-of-order callbacks, reorg revocation
