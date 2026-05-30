import { api } from "../../services/api"
import type { UserRole } from "../auth/auth.types"

export type MembershipPlan =
  | "LIBRE"
  | "MENSUAL"
  | "TRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL"

export type MembershipStatus =
  | "NO_APLICA"
  | "SIN_MEMBRESIA"
  | "ACTIVA"
  | "POR_VENCER"
  | "VENCIDA"

export type AdminUserResponse = {
  id: number
  fullName: string
  email: string
  role: UserRole
  active: boolean
  dni: string | null
  phoneNumber: string | null
  membershipPlan: MembershipPlan | null
  membershipAmount: number | null
  membershipStartDate: string | null
  membershipEndDate: string | null
  membershipStatus: MembershipStatus
  coachId: number | null
  coachName: string | null
  createdAt: string
}

export type CreateUserFormData = {
  fullName: string
  email: string
  password: string
  role: UserRole
  dni: string | null
  phoneNumber: string | null
  membershipPlan: MembershipPlan | null
  membershipAmount: number | null
  membershipStartDate: string | null
  coachId: number | null
}

export type UpdateUserFormData = {
  fullName: string
  email: string
  role: UserRole
  active: boolean
  dni: string | null
  phoneNumber: string | null
  membershipPlan: MembershipPlan | null
  membershipAmount: number | null
  membershipStartDate: string | null
  coachId: number | null
}

export type AttendanceResponse = {
  id: number
  studentId: number
  studentName: string
  dni: string
  phoneNumber: string | null
  membershipStatus: MembershipStatus
  checkInAt: string
  totalAttendances: number
}

export async function getAdminUsersRequest() {
  const response = await api.get<AdminUserResponse[]>("/admin/users")
  return response.data
}

export async function createAdminUserRequest(data: CreateUserFormData) {
  const response = await api.post<AdminUserResponse>("/admin/users", data)
  return response.data
}

export async function updateAdminUserRequest(
  id: number,
  data: UpdateUserFormData,
) {
  const response = await api.put<AdminUserResponse>(`/admin/users/${id}`, data)
  return response.data
}

export async function toggleAdminUserActiveRequest(id: number) {
  const response = await api.patch<AdminUserResponse>(
    `/admin/users/${id}/toggle-active`,
  )
  return response.data
}

export async function deleteAdminUserRequest(id: number) {
  await api.delete(`/admin/users/${id}`)
}

export async function getAdminAttendancesRequest() {
  const response = await api.get<AttendanceResponse[]>("/admin/attendances")
  return response.data
}

export async function registerAttendanceByDniRequest(dni: string) {
  const response = await api.post<AttendanceResponse>(
    "/admin/attendances/check-in",
    { dni },
  )

  return response.data
}
