import { createServer, type Server } from "node:http"

export function createApp(): Server {
  return createServer((req, res) => {
    try {
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "content-type": "application/json" })
        res.end(JSON.stringify({ status: "ok" }))
        return
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
