import { createServer, type Server } from "node:http"
import { net2Gross, VATRATE } from "./helper"

export function createApp(): Server {
  return createServer((req, res) => {
    try {
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "content-type": "application/json" })
        res.end(JSON.stringify({ status: "ok" }))
        return
      }

      const url = new URL(req.url ?? "/", "http://localhost")

      if (req.method === "GET" && url.pathname === "/invoice") {
        const raw = url.searchParams.get("net")
        const isValidPrice = raw !== null && /^\d+(\.\d{1,2})?$/.test(raw)
        if (isValidPrice) {
          const price = net2Gross(raw)
          const grossPrice = Number((price * (1 + VATRATE)).toFixed(2))

          res.writeHead(200, { "content-type": "application/json" })
          res.end(
            JSON.stringify({
              net: Number(raw),
              vatRate: VATRATE,
              gross: grossPrice,
            }),
          )
          return
        } else {
          res.writeHead(400, { "content-type": "application/json" })
          res.end(
            JSON.stringify({
              error: "invalid price",
            }),
          )
          return
        }
      }

      res.writeHead(404, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: "not found" }))
    } catch (err) {
      console.error(err)
      if (res.headersSent) {
        res.end()
        return
      }
      res.writeHead(500, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: "server error" }))
    }
  })
}
