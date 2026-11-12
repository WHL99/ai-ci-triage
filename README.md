# ai-ci-triage

## What this project proves

This project builds an AI-assisted CI failure triage flow. The goal: when CI
fails, Claude reads the logs and suggests a fix as a PR comment. It has
read-only access, so it cannot push or merge. Tests and CI decide what is
correct; the agent only speeds up diagnosis. The CI pipeline and the local
agent guardrails are in place; the in-pipeline triage agent is planned.

I don't trust a check until I have seen it fail when it should. I break
things on purpose to confirm a check catches them, and only then automate it.

For example, an agent can say "done" while the tests are broken. A Stop hook
runs `npm run type-check` and `npm test` before Claude is allowed to finish.
If either fails, the hook blocks the stop and hands the error output back to
Claude, up to two times. If the checks still fail after that, it lets Claude
stop and warns me instead, so a problem the agent cannot fix never turns
into an endless retry loop. I tested it by hand against passing checks, type
errors, failing tests and a broken hook, and in a real session where it
stopped Claude from finishing with a failing test.

## My Motivation

In my previous DevOps role, I used an LLM to automate a large-scale
repository analysis. It saved a lot of manual review, but it also showed
me that AI in a delivery pipeline needs clear guardrails.

This project explores one question: how can an AI agent help diagnose
CI failures without being trusted to decide what is correct? The agent
is read-only and only explains failures. Tests, CI and human review
remain the merge gate.


## Failure catalog

Each failure is injected on purpose on its own branch, so anyone can reproduce it. Each one has a write-up with my prediction, the actual CI result, the AI's diagnosis and the lessons.

| # | Failure | Caught by | Write-up | Status |
|---|---|---|---|---|
| 01 | Code uses a Node 26 API, but CI runs Node 24 | Test step | [01-node-version](docs/failures/01-node-version.md) | ✅ done |
| 02 | Failing test | Test step | [02-failing-test](docs/failures/02-failing-test.md) | ✅ done |
| 03 | NODE_ENV=production in the build stage | Build Docker Image step | [03-docker-env](docs/failures/03-docker-env.md) | ✅ done |