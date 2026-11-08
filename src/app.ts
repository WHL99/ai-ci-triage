import { createServer, type Server } from "node:http"
import validator from "validator"
const VATRATE: number = 0.19

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
        // const isValidPrice = raw !== null && /^\d+(\.\d{1,2})?$/.test(raw)

        const isValidPrice =
          raw !== null &&
          validator.isFloat(raw, { min: 0 }) &&
          validator.isDecimal(raw, { decimal_digits: "1,2" })

        if (isValidPrice) {
          const netPrice: number = Number(raw)
          const grossPrice: number = Number(
            (netPrice * (1 + VATRATE)).toFixed(2),
          )

          res.writeHead(200, { "content-type": "application/json" })
          res.end(
            JSON.stringify({
              net: netPrice,
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
