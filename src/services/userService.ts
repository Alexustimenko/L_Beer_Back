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

function isBcryptHash(value: string): boolean {
  return typeof value === "string" && value.startsWith("$2");
}

function upgradePlaintextPasswordIfNeeded(user: User, plainPassword: string, users: User[]): void {
  if (isBcryptHash(user.password)) return;
  if (user.password !== plainPassword) return;

  user.password = bcrypt.hashSync(plainPassword, 10);
  writeUsers(users);
}

// Создание нового пользователя (регистрация)
export function createUser(data: RegisterUserDTO): Omit<User, 'password'> {
  const users = readUsers()

  // Проверка на существующего пользователя
  const existingUser = users.find(u =>
    u.email === data.email || u.login === data.login || u.phone === data.phone
  )
  if (existingUser) {
    throw new Error('Пользователь с такими данными уже существует')
  }

  // Хеширование пароля
  const hashedPassword = bcrypt.hashSync(data.password, 10)

  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    login: data.login,
    phone: data.phone,
    password: hashedPassword,
    name: data.name
  }

  users.push(newUser)
  writeUsers(users)

  // Возвращаем пользователя без пароля
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export function findUserByEmail(email: string): User | null {
  const users = readUsers()
  return users.find(u => u.email === email) || null
}

export function findUserByLogin(login: string): User | null {
  const users = readUsers()
  return users.find(u => u.login === login) || null
}

export function findUserByPhone(phone: string): User | null {
  const users = readUsers()
  return users.find(u => u.phone === phone) || null
}

export function findUserByIdentifier(identifier: string): User | null {
  const users = readUsers()
  return (
    users.find(u => u.email === identifier || u.login === identifier || u.phone === identifier) ||
    null
  )
}

export function verifyUserPassword(user: User, password: string): boolean {
  const users = readUsers()
  const u = users.find(x => x.id === user.id)
  if (!u) return false

  if (!isBcryptHash(u.password)) {
    upgradePlaintextPasswordIfNeeded(u, password, users)
    return u.password === password || bcrypt.compareSync(password, u.password)
  }

  return bcrypt.compareSync(password, u.password)
}

// Поиск пользователя по ID
export function findUserById(id: string): Omit<User, 'password'> | null {
  const users = readUsers()
  const user = users.find(u => u.id === id)
  if (!user) return null
  
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}