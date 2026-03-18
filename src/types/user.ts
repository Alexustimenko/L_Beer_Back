export interface RegisterUserDTO {
  name: string
  email: string
  login: string
  phone: string
  password: string
}

export interface User extends RegisterUserDTO {
  id: string
}
