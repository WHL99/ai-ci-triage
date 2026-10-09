# SECURITY 

## Permissions matrix
Legend:
- ✅ allowed
- ❌ blocked (server-side, cannot be bypassed)
- ⚠️ blocked only by client-side rules (can be bypassed)
- 🕓 planned, not built or tested yet

| Action | Me (human gate) | Local Claude Code (acts with my GitHub identity) | Triage Agent (planned)|
|:-------:|:-------:|:-------:|:-------:|
| Push to a branch| ✅ | ✅ |🕓|
| Push to `main`  | ❌ ruleset      | ❌ ruleset  | 🕓|
| Merge a PR      |  ✅ via PR (CI check not required yet)|    ⚠️ `settings.json` (deny `gh pr merge`)             | 🕓|
| Read `.env`     | ✅          | ⚠️ `settings.json` (deny `Read .env`)  | n/a: `.env` is gitignored |
| Run a workflow on a branch | ✅ ¹ |✅ ¹ | 🕓|

¹ Runs before any review. No secrets are stored yet; mitigation planned for M4.


## Known limitations
- **merge deny can be bypassed via `gh api`.** Accepted because this is a
  solo repo where I am the only reviewer. In a team setup, requiring an
  approval from someone other than the author would close this gap on the
  server side.

- **The rule blocking access to `.env` can be bypassed using `grep` or a script.** Accepted because .env holds only local development values; no cloud, registry or deploy credentials exist in this project.

- **With my GitHub credentials, Claude can theoretically modify the ruleset.** Accepted for now because it would take deliberate, multi-step API calls. In a team setup, admin rights would be held by fewer people and agent sessions would never use an admin identity.

- **Workflows on a branch run before the code is reviewed.**