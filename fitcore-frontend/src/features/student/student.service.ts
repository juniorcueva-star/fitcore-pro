import { api } from "../../services/api"

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