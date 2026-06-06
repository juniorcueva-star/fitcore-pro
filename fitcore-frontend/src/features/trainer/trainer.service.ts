import { api } from "../../services/api"

export type MembershipStatus =
  | "NO_APLICA"
  | "SIN_MEMBRESIA"
  | "ACTIVA"
  | "POR_VENCER"
  | "VENCIDA"

export type TrainerStudentResponse = {
  id: number
  fullName: string
  email: string
  active: boolean
  dni: string | null
  phoneNumber: string | null
  profilePhotoUrl?: string | null
  membershipStatus: MembershipStatus
  goal: string
}

export type RoutineExerciseResponse = {
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

export type CreateRoutineExerciseFormData = {
  studentId: number
  exerciseName: string
  series: number
  repetitions: number
}

export type NutritionPlanResponse = {
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

export type SaveNutritionPlanFormData = {
  studentId: number
  breakfast: string
  morningSnack: string
  lunch: string
  afternoonSnack: string
  dinner: string
}

export async function getTrainerStudentsRequest() {
  const response = await api.get<TrainerStudentResponse[]>("/trainer/students")
  return response.data
}

export async function removeTrainerStudentRequest(studentId: number) {
  const response = await api.patch<{ message: string }>(
    `/trainer/students/${studentId}/remove`,
  )
  return response.data
}

export async function getTrainerRoutinesRequest() {
  const response = await api.get<RoutineExerciseResponse[]>("/trainer/routines")
  return response.data
}

export async function createTrainerRoutineRequest(
  data: CreateRoutineExerciseFormData,
) {
  const response = await api.post<RoutineExerciseResponse>(
    "/trainer/routines",
    data,
  )

  return response.data
}

export async function getTrainerNutritionPlansRequest() {
  const response = await api.get<NutritionPlanResponse[]>("/trainer/nutrition")
  return response.data
}

export async function saveTrainerNutritionPlanRequest(
  data: SaveNutritionPlanFormData,
) {
  const response = await api.post<NutritionPlanResponse>(
    "/trainer/nutrition",
    data,
  )

  return response.data
}
