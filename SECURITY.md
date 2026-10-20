# SECURITY 

## Permissions matrix
Legend:
- ✅ allowed
- ❌ blocked server-side by the ruleset (holds as long as the ruleset itself is not changed)
- ⚠️ blocked only by client-side rules (can be bypassed)
- 🕓 planned, not built or tested yet

| Action | Me (human gate) | Local Claude Code (acts with my GitHub identity) | Triage Agent (planned)|
|:-------:|:-------:|:-------:|:-------:|
| Push to a branch| ✅ | ✅ |🕓|
| Push to `main`  | ❌ ruleset      | ❌ ruleset  | 🕓|
| Merge a PR      |  ✅ via PR + green `ci/verify` check|    ⚠️ `settings.json` (deny `gh pr merge`)             | 🕓|
| Read `.env`     | ✅          | ⚠️ `settings.json` (deny `Read .env`)  | n/a: `.env` is gitignored |
| Run a workflow on a branch | ✅ ¹ |✅ ¹ | 🕓|

¹ Runs before any review. No secrets are stored yet; mitigation planned for M4.


## Known limitations
- **merge deny can be bypassed via `gh api`.** Accepted because this is a
  solo repo where I am the only reviewer. In a team setup, requiring an
  approval from someone other than the author would close this gap on the
  server side.

- **The rule blocking access to `.env` can be bypassed using `grep` or a script.** Accepted because `.env` holds only local development values; no cloud, registry or deploy credentials exist in this project.

- **With my GitHub credentials, Claude can theoretically modify the ruleset.** Accepted for now because it would take deliberate, multi-step API calls. In a team setup, admin rights would be held by fewer people and agent sessions would never use an admin identity.

- **Workflows on a branch run before the code is reviewed.**
Accepted because no secrets are stored in the repo yet. Mitigation to be decided later.

- **The Stop hook can push the agent to edit tests instead of code.**
When checks fail, the easiest way for the agent to finish is to change a test's expected value until it passes. This happened in a real session: the agent rewrote a deliberately failing assertion to get past the hook. `CLAUDE.md` now tells it not to do this and to ask instead, but that is guidance, not enforcement. Accepted because every change still goes through a PR: I review the diff, and edited assertions are visible there.

- **The Stop hook blocks at most twice per failure.** If checks are still
  failing after two blocked attempts, the hook lets the agent stop and shows
  me a warning (`systemMessage`) instead. This prevents an endless retry loop
  that burns tokens when the agent cannot fix the problem. Accepted because
  the warning hands the decision to me, and CI still blocks the merge.
  Verified by running the hook four times in a row against a failing test.

- **Tests not named `*.test.ts` are invisible to the hook.** The test script
  only runs files matching that pattern, so a failing `broken.spec.ts`
  passed the hook unnoticed. Such a file would also end up in the production
  build. `CLAUDE.md` sets the naming convention, but nothing enforces it.

- **Errors inside the hook fail closed, within the same limit.** I first
  found that if `npm` could not start (for example, a wrong working
  directory), the hook crashed and exited with code 1, which Claude Code
  treats as a non-blocking error: the agent could stop with nothing checked. The hook now treats this as a failed check, blocks the agent and reports why. Remaining gap: after two blocks it still lets the agent stop.
