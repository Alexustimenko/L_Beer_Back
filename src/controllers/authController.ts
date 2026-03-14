import { IncomingMessage, ServerResponse } from "http"
import { parseBody } from "../utils/bodyParser"
import { RegisterUserDTO } from "../types/user"
import { createUser } from "../services/userService"

export async function registerController(
  req: IncomingMessage,
  res: ServerResponse
) {

  const rawBody = await parseBody(req)

  const data: RegisterUserDTO = JSON.parse(rawBody)

  if (!data.email || !data.password || !data.name) {

    res.writeHead(400, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Invalid data" }))
    return
  }

  const user = createUser(data)

  res.writeHead(201, { "Content-Type": "application/json" })

  res.end(JSON.stringify({
    message: "User registered",
    user
  }))
}
