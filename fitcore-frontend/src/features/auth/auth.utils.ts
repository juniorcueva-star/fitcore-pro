import type { AuthUser, UserRole } from "./auth.types"

const AUTH_USER_STORAGE_KEY = "fitcore_user"
const AUTH_TOKEN_STORAGE_KEY = "fitcore_token"

export function saveAuthSession(user: AuthUser, token: string) {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function getAuthUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    return null
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function logoutAuthUser() {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function getDefaultPathByRole(role: UserRole) {
  if (role === "ADMIN") {
    return "/admin"
  }

  if (role === "TRAINER") {
    return "/entrenador"
  }

  return "/alumno"
}