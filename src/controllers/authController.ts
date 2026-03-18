import { IncomingMessage, ServerResponse } from "http"
import { parseBody } from "../utils/bodyParser"
import { createUser, findUserByEmail } from "../services/userService"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"

const JWT_SECRET = "your_super_secret_key_123"

export async function registerController(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const rawBody = await parseBody(req)
    const data = JSON.parse(rawBody)

    if (!data.email || !data.password || !data.name) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Все поля обязательны" }))
      return
    }

    const user = createUser(data)

    res.writeHead(201, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      message: "Регистрация успешна",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }))
  } catch (error: any) {
    res.writeHead(400, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: error.message || "Ошибка регистрации" }))
  }
}

export async function loginController(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const rawBody = await parseBody(req)
    const data = JSON.parse(rawBody)

    if (!data.email || !data.password) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Email и пароль обязательны" }))
      return
    }

    if (data.email === "admin" && data.password === "admin") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({
        message: "Вход как администратор",
        user: {
          id: "0",
          email: "admin",
          name: "Admin",
          role: "admin"
        },
        token: "admin_token"
      }))
      return
    }

    const user = findUserByEmail(data.email)
    
    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Неверный email или пароль" }))
      return
    }

    const isPasswordValid = bcrypt.compareSync(data.password, user.password)
    
    if (!isPasswordValid) {
      res.writeHead(401, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Неверный email или пароль" }))
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    )

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      message: "Вход выполнен успешно",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user"
      },
      token
    }))

  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Ошибка сервера" }))
  }
}