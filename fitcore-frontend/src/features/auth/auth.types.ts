export type UserRole = "ADMIN" | "TRAINER" | "STUDENT"

export type AuthUser = {
  id: number
  fullName: string
  email: string
  role: UserRole
}

export type LoginFormData = {
  email: string
  password: string
}

export type LoginResponse = {
  id: number
  fullName: string
  email: string
  role: UserRole
  token: string
}

export type UserProfileResponse = {
  id: number
  fullName: string
  email: string
  role: UserRole
  active: boolean
}