## Commands
1. Use npm script to run tools. Please don't directly run command `tsc`
Here are the main useful commands in this project: 
- `npm test`: to run test files
- `npm run type-check`: to check types without emitting files 
- `npm run build`: to run build without emitting test files
- `npm start`: to start a server, you must run `npm run build` to build a latest `server.js`
- `npm run docker:build` to build a docker image

2. Before finishing, you must run `npm run type-check` and `npm test`

3. Before committing, you must run `npm run format` to format the code

## Conventions
Test files are named `*.test.ts`. Tests with other names will not be run, nor will they be excluded from the build.

## Tests
- Never change an existing test's expected value just to make it pass. A failing test may be catching a real bug.
- If you think a test itself is wrong, explain why and ask me before editing it. It is fine to finish with that test still failing.

## Workflow
Never push to `main`. Work on branch, you may open PR. But never merge PR, only a human merges PRs.

## Protected files
Don't edit files in `.github/workflows/`, `.claude/`, `Dockerfile`. You must ask me for permission before editing.

