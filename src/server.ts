import { createApp } from "./app"

const port = Number(process.env.PORT ?? 3000)
const SHUTDOWN_TIMEOUT_MS = 5000

const server = createApp().listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})

const shutdown = (signal: string) => {
  console.log(`received ${signal}, shutting down`)
  server.close(() => {
    process.exit(0)
  })
  setTimeout(() => {
    console.error(
      `forced shutdown: connections still open after ${SHUTDOWN_TIMEOUT_MS}ms`,
    )
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
