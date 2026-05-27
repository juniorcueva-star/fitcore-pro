import { api } from "../../services/api"

export type TrainerStudentResponse = {
  id: number
  fullName: string
  email: string
  active: boolean
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

export async function getTrainerStudentsRequest() {
  const response = await api.get<TrainerStudentResponse[]>("/trainer/students")
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