import * as fs from "fs"
import * as path from "path"
import { RegisterUserDTO, User } from "../types/user"

const usersFile = path.join(__dirname, "../storage/users.json")

export function createUser(data: RegisterUserDTO): User {

  const file = fs.readFileSync(usersFile, "utf-8")
  const users: User[] = JSON.parse(file)

  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    password: data.password,
    name: data.name
  }

  users.push(newUser)

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))

  return newUser
}
