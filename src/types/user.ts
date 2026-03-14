export interface RegisterUserDTO {
  email: string
  password: string
  name: string
}

export interface User extends RegisterUserDTO {
  id: string
}
