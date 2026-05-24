import { api } from "./api"

export type DashboardAccessResponse = {
  message: string
  user: string
}

export async function getAdminDashboardAccess() {
  const response = await api.get<DashboardAccessResponse>("/admin/dashboard")
  return response.data
}

export async function getTrainerDashboardAccess() {
  const response = await api.get<DashboardAccessResponse>("/trainer/dashboard")
  return response.data
}

export async function getStudentDashboardAccess() {
  const response = await api.get<DashboardAccessResponse>("/student/dashboard")
  return response.data
}