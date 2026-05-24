import { api } from "../../services/api"
import type { UserRole } from "../auth/auth.types"

export type AdminUserResponse = {
  id: number
  fullName: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

export type CreateUserFormData = {
  fullName: string
  email: string
  password: string
  role: UserRole
}

export async function getAdminUsersRequest() {
  const response = await api.get<AdminUserResponse[]>("/admin/users")
  return response.data
}

export async function createAdminUserRequest(data: CreateUserFormData) {
  const response = await api.post<AdminUserResponse>("/admin/users", data)
  return response.data
}