import { IncomingMessage, ServerResponse } from "http"
import { registerController, loginController } from "../controllers/authController"

export async function router(
  req: IncomingMessage,
  res: ServerResponse
) {
  // Регистрация
  if (req.method === "POST" && req.url === "/register") {
    await registerController(req, res)
    return
  }

  // Вход
  if (req.method === "POST" && req.url === "/login") {
    await loginController(req, res)
    return
  }

  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ message: "Route not found" }))
}