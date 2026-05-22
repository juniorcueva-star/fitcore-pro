export type UserRole = "ADMIN" | "TRAINER" | "STUDENT"

export type AuthUser = {
  id: number
  name: string
  email: string
  role: UserRole
}

export type LoginFormData = {
  email: string
  password: string
}