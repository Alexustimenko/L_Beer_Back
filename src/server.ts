import * as http from "http"
import { router } from "./router/router"

const PORT = 5000

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  await router(req, res)

})

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})