# /babysit

Shepherd one open PR toward merge without supervision. Each run is a single
pass: assess state, take the smallest corrective action, report, and stop.
Designed to run on `/loop` — e.g. `/loop 5m /babysit`.

Usage: `/babysit` (current branch's PR) · `/babysit 1234` (a specific PR).

## Step 1 — Identify the target PR
The current branch's PR, or a passed number. If none is open, report and stop —
do not open one. Capture CI status, mergeable state, unresolved review threads.

## Step 2 — Triage (one action per pass, highest priority first)
CI includes: **Tests** (`python -m pytest tests/ -q --ignore=tests/integration
--ignore=tests/e2e -n auto`), **e2e** (`pytest tests/e2e/ -v`), **nix**,
**docker-publish**, **supply-chain-audit**, **contributor-check**, and
**docs-site-checks**. Reproduce locally: `source venv/bin/activate` (per the dev
guide), deps via `uv`, then run the relevant `pytest`.

1. **Failing CI** → read the failing job's logs, apply the minimal fix, push:
   - **Tests / e2e** → reproduce the failing test, fix code or test; never delete
     or skip a test to go green.
   - **nix** → fix the flake/derivation as the log indicates.
   - **docs-site-checks** → fix the docs build/link error.
   - **supply-chain-audit** → a flagged dependency is a real signal — do not add or
     pin an unvetted dep to pass; surface it.
   - **contributor-check** → an attribution/DCO issue: correct the commit metadata,
     don't bypass the check.
2. **Conflict / behind base** → rebase onto the base branch, resolve conservatively, push.
3. **Review comments** → apply each actionable change; reply only where it adds info; resolve addressed threads.
4. **All green, no open comments** → report ready-to-merge (never merge a critical change).

## Step 3 — Guardrails
- Stay on the designated branch; smallest footprint; one logical change per push.
- **Sensitive surfaces are human-review-only** — auth/secrets, the
  supply-chain/dependency set, Docker publish/release, and any credential path stay
  human-review. Apply only mechanical test/lint fixes there and escalate the rest.
- **No secrets in git.** Never add a key/token to make a check pass.
- Ambiguous or architecturally significant fix → ASK, don't guess.
- Verify against the real CI result before reporting green.

## Step 4 — Report
`PR #<n> · <state>  (CI: <pass/fail> · conflicts: <y/n> · open comments: <n>)`
`Action this pass: <what changed, or "none — waiting on CI / human review">`
Stay silent on no-op passes. Stop when the PR is merged or closed.

Canonical spec: `ai-brain/patterns/babysit.md`.

In a web/remote session, subscribing to the PR's activity is the event-driven
equivalent — CI and review events wake the session instead of polling.
