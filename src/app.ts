import { createServer, type Server } from "node:http"
const VAT_PERCENT: number = 19
const VAT_RATE: number = VAT_PERCENT / 100

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
          // Calculate in integer cents, so rounding is not affected by binary floating-point errors
          const netPrice: number = Number(raw)
          const netCents = Math.round(netPrice * 100)
          const grossCents = Math.round((netCents * (100 + VAT_PERCENT)) / 100)
          const grossPrice = grossCents / 100

          res.writeHead(200, { "content-type": "application/json" })
          res.end(
            JSON.stringify({
              net: netPrice,
              vatRate: VAT_RATE,
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
