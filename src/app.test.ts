import { test, TestContext } from "node:test"
import assert from "node:assert/strict"
import type { AddressInfo } from "node:net"
import { createApp } from "./app"

async function startServer(t: TestContext): Promise<string> {
  const server = createApp().listen(0)
  t.after(() => server.close())
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const { port } = server.address() as AddressInfo
  return `http://localhost:${port}`
}

test("GET /health returns 200 with status ok", async (t) => {
  const baseUrl = await startServer(t)
  const res = await fetch(`${baseUrl}/health`)

  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { status: "ok" })
})

const invalidQueries = ["", "?net=", "?net=-1", "?net=xyz"]

for (const query of invalidQueries) {
  test(`GET /invoice${query} returns 400 with invalid price`, async (t) => {
    const baseUrl = await startServer(t)
    const res = await fetch(`${baseUrl}/invoice${query}`)

    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: "invalid price" })
  })
}

const validCases = [
  { query: "?net=0", expected: { net: 0, vatRate: 0.19, gross: 0 } },
  {
    query: "?net=19.99",
    expected: { net: 19.99, vatRate: 0.19, gross: 23.79 },
  },
  { query: "?net=100", expected: { net: 100, vatRate: 0.19, gross: 119 } },
  { query: "?net=0.50", expected: { net: 0.5, vatRate: 0.19, gross: 0.6 } },
  { query: "?net=3.50", expected: { net: 3.5, vatRate: 0.19, gross: 4.17 } },
]

for (const { query, expected } of validCases) {
  test(`GET /invoice${query} returns 200 with gross ${expected.gross}`, async (t) => {
    const baseUrl = await startServer(t)
    const res = await fetch(`${baseUrl}/invoice${query}`)

    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), expected)
  })
}
