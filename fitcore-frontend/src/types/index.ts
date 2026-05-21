export type AppView = "login" | "admin" | "trainer" | "student"

export type Enrollment = {
  id: number
  name: string
  coach: string
  status: string
  expiration: string
}

export type TrainerStudent = {
  id: number
  name: string
  goal: string
  image: string
}

export type RoutineExercise = {
  id: number
  name: string
  sets: number
  reps: number
}