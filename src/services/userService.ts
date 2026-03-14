import * as fs from "fs"
import * as path from "path"
import { RegisterUserDTO, User } from "../types/user"
import * as bcrypt from "bcryptjs"

const usersFile = path.join(__dirname, "../storage/users.json")

// Чтение пользователей из файла
function readUsers(): User[] {
  try {
    const file = fs.readFileSync(usersFile, "utf-8")
    return JSON.parse(file)
  } catch (error) {
    return []
  }
}

// Запись пользователей в файл
function writeUsers(users: User[]): void {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

// Создание нового пользователя (регистрация)
export function createUser(data: RegisterUserDTO): Omit<User, 'password'> {
  const users = readUsers()

  // Проверка на существующего пользователя
  const existingUser = users.find(u => u.email === data.email)
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует')
  }

  // Хеширование пароля
  const hashedPassword = bcrypt.hashSync(data.password, 10)

  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    password: hashedPassword,
    name: data.name
  }

  users.push(newUser)
  writeUsers(users)

  // Возвращаем пользователя без пароля
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

// Поиск пользователя по email (для входа)
export function findUserByEmail(email: string): User | null {
  const users = readUsers()
  return users.find(u => u.email === email) || null
}

// Поиск пользователя по ID
export function findUserById(id: string): Omit<User, 'password'> | null {
  const users = readUsers()
  const user = users.find(u => u.id === id)
  if (!user) return null
  
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}