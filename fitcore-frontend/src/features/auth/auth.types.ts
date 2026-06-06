export type UserRole = "ADMIN" | "TRAINER" | "STUDENT"

export type AuthUser = {
  id: number
  fullName: string
  email: string
  role: UserRole
  profilePhotoUrl?: string | null
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
  profilePhotoUrl?: string | null
}

export type UserProfileResponse = {
  id: number
  fullName: string
  email: string
  role: UserRole
  active: boolean
  profilePhotoUrl?: string | null
}
