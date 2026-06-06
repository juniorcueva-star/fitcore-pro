import { api } from "../../services/api"
import type { UserRole } from "../auth/auth.types"

export type StudentRoutineResponse = {
  id: number
  studentId: number
  studentName: string
  trainerId: number
  trainerName: string
  exerciseName: string
  series: number
  repetitions: number
  completed: boolean
  createdAt: string
  completedAt: string | null
}

export type StudentNutritionPlanResponse = {
  id: number
  studentId: number
  studentName: string
  trainerId: number
  trainerName: string
  breakfast: string | null
  morningSnack: string | null
  lunch: string | null
  afternoonSnack: string | null
  dinner: string | null
  createdAt: string
  updatedAt: string
}

export type StudentProfileResponse = {
  id: number
  fullName: string
  email: string
  role: UserRole
  active: boolean
  dni: string | null
  phoneNumber: string | null
  fitnessGoal: string | null
  profilePhotoUrl: string | null
  membershipPlan: string | null
  membershipAmount: number | null
  membershipStartDate: string | null
  membershipEndDate: string | null
  membershipStatus: string
  coachId: number | null
  coachName: string | null
  createdAt: string
}

export type StudentAttendanceStatus = "ASISTIO" | "NO_ASISTIO" | "FUTURO"

export type StudentAttendanceDayResponse = {
  date: string
  attended: boolean
  futureDay: boolean
  status: StudentAttendanceStatus
}

export type ProfilePhotoResponse = {
  userId: number
  fullName: string
  email: string
  profilePhotoUrl: string | null
}

export async function getStudentRoutinesRequest() {
  const response = await api.get<StudentRoutineResponse[]>("/student/routines")
  return response.data
}

export async function toggleStudentRoutineCompletedRequest(id: number) {
  const response = await api.patch<StudentRoutineResponse>(
    `/student/routines/${id}/toggle-completed`,
  )

  return response.data
}

export async function getStudentNutritionPlansRequest() {
  const response = await api.get<StudentNutritionPlanResponse[]>(
    "/student/nutrition",
  )

  return response.data
}

export async function getStudentProfileRequest() {
  const response = await api.get<StudentProfileResponse>("/student/profile")
  return response.data
}

export async function updateStudentFitnessGoalRequest(fitnessGoal: string) {
  const response = await api.patch<StudentProfileResponse>(
    "/student/profile/goal",
    { fitnessGoal },
  )

  return response.data
}

export async function getStudentAttendanceMonthRequest(
  year: number,
  month: number,
) {
  const response = await api.get<StudentAttendanceDayResponse[]>(
    `/student/attendances/month?year=${year}&month=${month}`,
  )

  return response.data
}

export async function uploadStudentProfilePhotoRequest(photo: File) {
  const formData = new FormData()
  formData.append("photo", photo)

  const response = await api.post<ProfilePhotoResponse>(
    "/profile/photo",
    formData,
  )

  return response.data
}

export async function removeStudentProfilePhotoRequest() {
  const response = await api.delete<ProfilePhotoResponse>("/profile/photo")
  return response.data
}
