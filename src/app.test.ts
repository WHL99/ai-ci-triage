import { test } from "node:test"
import assert from "node:assert/strict"
import type { AddressInfo } from "node:net"
import { createApp } from "./app"

test("GET /health returns 200 with status ok", async (t) => {
  const server = createApp().listen(0)
  t.after(() => server.close())
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const { port } = server.address() as AddressInfo

  const res = await fetch(`http://localhost:${port}/health`)

  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { status: "ok" })
})
