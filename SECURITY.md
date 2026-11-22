# SECURITY 

## Permissions matrix
Legend:
- ✅ allowed
- ❌ blocked server-side by the ruleset (holds as long as the ruleset itself is not changed)
- ⚠️ blocked only by client-side rules (can be bypassed)
- 🕓 planned, not built or tested yet

| Action | Me (human gate) | Local Claude Code (acts with my GitHub identity) | Triage Agent (planned)|
|:-------:|:-------:|:-------:|:-------:|
| Push to a branch| ✅ | ✅ |🕓 planned: 🔒 read-only token, no shell tool|
| Push to `main`  | ❌ ruleset      | ❌ ruleset  |🕓 planned: 🔒 + ❌ ruleset |
| Merge a PR      |  ✅ via PR + green `ci/verify` check| ⚠️ `settings.json` (deny `gh pr merge`)|🕓 planned: 🔒 read-only token|
| Read `.env`     | ✅          | ⚠️ `settings.json` (deny `Read .env`)  | n/a: `.env` is gitignored |
| Run a workflow on a branch | ✅ ¹ |✅ ¹ |🕓 planned: 🔒 cannot push |
| Edit files in the working tree | ✅ | ⚠️ permission prompt, manual mode only | 🕓 planned: no edit tools; the runner is discarded |
| Run code from the PR | ✅ | ✅ | 🕓 planned: no shell tool |
| Comment on a PR | ✅ | ✅ | 🕓 planned: only the separate `comment` job can |
| Secrets it can use | all mine | my GitHub identity | 🕓 planned: Claude API key only |

¹ Runs before any review. No secrets are stored yet; mitigation planned for M4.


## Known limitations
- **The merge deny can be bypassed via `gh api`.** Accepted because this is a
  solo repo where I am the only reviewer. In a team setup, requiring an
  approval from someone other than the author would close this gap on the
  server side.

- **The rule blocking access to `.env` can be bypassed using `grep` or a script.** Accepted because `.env` holds only local development values; no cloud, registry or deploy credentials exist in this project.

- **With my GitHub credentials, Claude can theoretically modify the ruleset.** Accepted for now because it would take deliberate, multi-step API calls. In a team setup, admin rights would be held by fewer people and agent sessions would never use an admin identity.

- **Workflows on a branch run before the code is reviewed.**
Accepted because no secrets are stored in the repo yet. Mitigation to be decided later.

- **The Stop hook can push the agent to change code it was not asked to change.** When checks fail, the hook does not let the agent finish, so the easiest way out is to make the checks pass. This happened in two ways in real sessions:

  - The agent rewrote a deliberately failing assertion to get past the hook. `CLAUDE.md` now tells it not to do this and to ask instead.
  - In [real/01](docs/reals/01-vat-rounded-down.md), I asked only for a diagnosis. In all three runs, the agent asked whether to apply a fix, but the hook blocked it before I could answer, and it tried to edit `app.ts` instead. It did not touch the test.

  Accepted because every change still goes through a PR: I review the diff, and unrequested edits are visible there. A Stop hook that only blocks when the agent has changed files in the session would let diagnosis-only sessions end normally. My `CLAUDE.md` also allows finishing with a failing test when the test
  looks wrong, which the hook does not allow either.

- **The permission prompt only protects in manual mode.** In real/01,
  the permission prompt stopped the agent's unrequested edits in the
  first two runs. In a third run with edits approved automatically, the
  same edit was written to `app.ts`. The agent told me what it had
  changed and did not commit it. Accepted because the layers behind it
  still hold: even if the agent committed and pushed, it could only push
  to a branch. The ruleset on `main` requires a PR with a green check,
  and merging is denied in `settings.json`. When I ask the agent only to
  diagnose, I use manual approvals.

- **The Stop hook blocks at most twice per failure.** If checks are still
  failing after two blocked attempts, the hook lets the agent stop and shows
  me a warning (`systemMessage`) instead. This prevents an endless retry loop
  that burns tokens when the agent cannot fix the problem. Accepted because
  the warning hands the decision to me, and CI still blocks the merge.
  Verified by running the hook four times in a row against a failing
  test, and seen in real sessions in
  [failure 02](docs/failures/02-failing-test.md) and
  [real/01](docs/reals/01-vat-rounded-down.md).

- **Tests not named `*.test.ts` are invisible to the hook.** The test script
  only runs files matching that pattern, so a failing `broken.spec.ts`
  passed the hook unnoticed. Such a file would also end up in the production
  build. `CLAUDE.md` sets the naming convention, but nothing enforces it.

- **Errors inside the hook fail closed, within the same limit.** I first
  found that if `npm` could not start (for example, a wrong working
  directory), the hook crashed and exited with code 1, which Claude Code
  treats as a non-blocking error: the agent could stop with nothing checked. The hook now treats this as a failed check, blocks the agent and reports why. Remaining gap: after two blocks it still lets the agent stop.
