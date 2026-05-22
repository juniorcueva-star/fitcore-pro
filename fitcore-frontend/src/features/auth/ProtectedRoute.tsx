import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import type { UserRole } from "./auth.types"
import { getAuthUser, getDefaultPathByRole } from "./auth.utils"

type ProtectedRouteProps = {
  allowedRoles: UserRole[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const user = getAuthUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathByRole(user.role)} replace />
  }

  return children
}