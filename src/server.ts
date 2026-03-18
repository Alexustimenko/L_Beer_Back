import * as http from "http"
import { router } from "./router/router"

const PORT = 5000

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

  // CORS
  const origin = req.headers.origin
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  await router(req, res)

})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})