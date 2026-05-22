import type { AuthUser, UserRole } from "./auth.types"

const AUTH_STORAGE_KEY = "fitcore_user"

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function getAuthUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function logoutAuthUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
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