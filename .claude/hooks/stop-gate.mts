import { spawnSync } from "node:child_process"

import { readFileSync, rmSync, writeFileSync } from "node:fs"

import { tmpdir } from "node:os"
import { join } from "node:path"

const MAX_BLOCKS = 2

const readInput = (): { session_id?: string } => {
  try {
    return JSON.parse(readFileSync(0, "utf8"))
  } catch {
    return {}
  }
}

const input = readInput()

const counterFile = join(tmpdir(), `stop-gate-${input.session_id ?? "default"}`)

const readCount = (): number => {
  try {
    return Number(readFileSync(counterFile, "utf8"))
  } catch {
    return 0
  }
}

const readCountResult: number = readCount()

const SCRIPTS: string[] = ["type-check", "test"]

for (const script of SCRIPTS) {
  const result = spawnSync("npm", ["run", script], {
    cwd: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
  })
  if (result.status !== 0 && readCountResult < MAX_BLOCKS) {
    const count: number = readCountResult + 1
    writeFileSync(counterFile, count.toString())

    console.error(
      `npm run ${script} failed stderr:`,
      result.stderr?.toString() ?? "",
    )
    console.error(
      `npm run ${script} failed stdout:`,
      result.stdout?.toString() ?? "",
    )
    if (result.error) {
      console.error(`Could not run npm run ${script}:`, result.error.message)
    }

    process.exit(2)
  } else if (result.status !== 0 && readCountResult >= MAX_BLOCKS) {
    rmSync(counterFile, { force: true })
    console.log(
      JSON.stringify({
        systemMessage: `npm run ${script} is still failing after ${MAX_BLOCKS} attempts. Claude stopped trying. Please run "npm run ${script}" to see the errors.`,
      }),
    )
    process.exit(0)
  }
}

rmSync(counterFile, { force: true })

process.exit(0)
