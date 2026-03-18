import { IncomingMessage, ServerResponse } from "http"
import { parseBody } from "../utils/bodyParser"
import { createUser, findUserById, findUserByIdentifier, verifyUserPassword } from "../services/userService"
import { createSession, deleteSession, getSession } from "../services/sessionService"
import { parseCookies, setCookie } from "../utils/cookies"

const SESSION_TTL_SECONDS = 60 * 10 // 10 минут

export async function registerController(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const rawBody = await parseBody(req)
    const data = JSON.parse(rawBody)

    if (!data.email || !data.login || !data.phone || !data.password || !data.name) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Все поля обязательны" }))
      return
    }

    const user = createUser(data)

    const session = createSession(user.id, SESSION_TTL_SECONDS)
    setCookie(res, "sid", session.id, { httpOnly: true, maxAgeSeconds: SESSION_TTL_SECONDS, sameSite: "Lax", path: "/" })

    res.writeHead(201, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      message: "Регистрация успешна",
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        phone: user.phone,
        name: user.name
      }
    }))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ошибка регистрации"
    res.writeHead(400, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message }))
  }
}

export async function loginController(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const rawBody = await parseBody(req)
    const data = JSON.parse(rawBody)

    if (!data.identifier || !data.password) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Логин/email/телефон и пароль обязательны" }))
      return
    }

    const user = findUserByIdentifier(data.identifier)
    
    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Неверный email или пароль" }))
      return
    }

    const isPasswordValid = verifyUserPassword(user, data.password)
    
    if (!isPasswordValid) {
      res.writeHead(401, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Неверный email или пароль" }))
      return
    }

    const session = createSession(user.id, SESSION_TTL_SECONDS)
    setCookie(res, "sid", session.id, { httpOnly: true, maxAgeSeconds: SESSION_TTL_SECONDS, sameSite: "Lax", path: "/" })

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      message: "Вход выполнен успешно",
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        phone: user.phone,
        name: user.name
      }
    }))

  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Ошибка сервера" }))
  }
}

export async function meController(req: IncomingMessage, res: ServerResponse) {
  const cookies = parseCookies(req)
  const sid = cookies.sid
  if (!sid) {
    res.writeHead(401, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Unauthorized" }))
    return
  }
  const session = getSession(sid)
  if (!session) {
    res.writeHead(401, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Session expired" }))
    return
  }
  const user = findUserById(session.userId)
  if (!user) {
    res.writeHead(401, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Unauthorized" }))
    return
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ user }))
}

export async function logoutController(req: IncomingMessage, res: ServerResponse) {
  const cookies = parseCookies(req)
  const sid = cookies.sid
  if (sid) deleteSession(sid)

  // очищаем cookie
  setCookie(res, "sid", "", { httpOnly: true, maxAgeSeconds: 0, sameSite: "Lax", path: "/" })

  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ message: "Logged out" }))
}