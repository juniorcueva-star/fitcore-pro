import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Check,
  Dumbbell,
  Home,
  Salad,
  Trophy,
  User,
} from "lucide-react"
import {
  getStudentDashboardAccess,
  type DashboardAccessResponse,
} from "../../services/dashboard.service"
import { getMyProfileRequest } from "../auth/auth.service"
import type { UserProfileResponse } from "../auth/auth.types"
import {
  getStudentRoutinesRequest,
  toggleStudentRoutineCompletedRequest,
  type StudentRoutineResponse,
} from "./student.service"

const bottomNavigationItems = [
  { label: "Inicio", icon: Home, active: true },
  { label: "Agenda", icon: CalendarDays, active: false },
  { label: "Nutrición", icon: Salad, active: false },
  { label: "Perfil", icon: User, active: false },
]

function getFirstName(fullName?: string) {
  if (!fullName) {
    return "Alumno"
  }

  return fullName.trim().split(" ")[0]
}

export function StudentApp() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)

  const [backendStatus, setBackendStatus] =
    useState<DashboardAccessResponse | null>(null)

  const [routines, setRoutines] = useState<StudentRoutineResponse[]>([])
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true)
  const [routinesError, setRoutinesError] = useState("")

  useEffect(() => {
    let isActive = true

    getMyProfileRequest()
      .then((data) => {
        if (isActive) {
          setProfile(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setProfile(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getStudentDashboardAccess()
      .then((data) => {
        if (isActive) {
          setBackendStatus(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setBackendStatus(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getStudentRoutinesRequest()
      .then((data) => {
        if (isActive) {
          setRoutines(data)
          setRoutinesError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setRoutinesError("No se pudieron cargar tus rutinas.")
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingRoutines(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const completedCount = useMemo(
    () => routines.filter((routine) => routine.completed).length,
    [routines],
  )

  const totalExercises = routines.length

  const progressPercentage =
    totalExercises === 0
      ? 0
      : Math.round((completedCount / totalExercises) * 100)

  const studentFirstName = getFirstName(profile?.fullName)
  const studentInitial = profile?.fullName?.charAt(0).toUpperCase() ?? "A"
  const trainerName = routines[0]?.trainerName ?? "Sin entrenador asignado"

  const handleToggleRoutine = async (routineId: number) => {
    try {
      const updatedRoutine = await toggleStudentRoutineCompletedRequest(
        routineId,
      )

      setRoutines((currentRoutines) =>
        currentRoutines.map((routine) =>
          routine.id === updatedRoutine.id ? updatedRoutine : routine,
        ),
      )
    } catch {
      setRoutinesError("No se pudo actualizar el ejercicio.")
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pt-24 pb-28 text-white">
      <section className="mx-auto max-w-md">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-yellow-500">
              App del Alumno
            </p>

            <h1 className="mt-1 text-3xl font-black">
              ¡Hola, {studentFirstName}!
            </h1>

            <p className="mt-1 text-sm text-neutral-400">
              Listo para entrenar hoy.
            </p>

            {backendStatus && (
              <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                <p className="text-xs font-bold text-yellow-500">
                  {backendStatus.message}
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Usuario: {backendStatus.user}
                </p>
              </div>
            )}
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-yellow-500 bg-neutral-900 text-xl font-black text-yellow-500">
            {studentInitial}
          </div>
        </header>

        <article className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-2xl font-black text-black">
              {trainerName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm text-neutral-400">
                Tu Entrenador Asignado
              </p>

              <h2 className="mt-1 text-xl font-black">{trainerName}</h2>

              <p className="mt-1 text-xs text-neutral-500">
                Rutinas personalizadas desde FitCore Pro
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98]"
          >
            <CalendarDays size={20} />
            Agendar Entrenamiento
          </button>
        </article>

        <article className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Progreso de hoy</p>
              <h2 className="mt-1 text-2xl font-black">
                {completedCount}/{totalExercises} completados
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
              <Trophy size={24} />
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-neutral-400">
            Avance actual:{" "}
            <span className="font-bold text-yellow-500">
              {progressPercentage}%
            </span>
          </p>
        </article>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Mi Rutina de Hoy</h2>

              <p className="mt-1 text-sm text-neutral-400">
                Rutinas reales asignadas por tu entrenador.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
              <Dumbbell size={22} />
            </div>
          </div>

          {isLoadingRoutines && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
              Cargando tus rutinas...
            </div>
          )}

          {routinesError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
              {routinesError}
            </div>
          )}

          {!isLoadingRoutines && !routinesError && routines.length === 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
              Todavía no tienes rutinas asignadas.
            </div>
          )}

          {!isLoadingRoutines && !routinesError && routines.length > 0 && (
            <div className="space-y-4">
              {routines.map((routine) => (
                <article
                  key={routine.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                    routine.completed
                      ? "border-yellow-500/70 bg-yellow-500/10"
                      : "border-neutral-800 bg-neutral-900"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-bold ${
                        routine.completed ? "text-yellow-500" : "text-white"
                      }`}
                    >
                      {routine.exerciseName}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      {routine.series} Series x {routine.repetitions} Reps
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Entrenador: {routine.trainerName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleRoutine(routine.id)}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${
                      routine.completed
                        ? "border-yellow-500 bg-yellow-500 text-black"
                        : "border-neutral-700 bg-neutral-950 text-neutral-500 hover:border-yellow-500 hover:text-yellow-500"
                    }`}
                    aria-label={`Marcar ${routine.exerciseName} como completado`}
                  >
                    {routine.completed && <Check size={24} strokeWidth={3} />}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-neutral-800 bg-neutral-900/95 px-3 py-3 shadow-2xl backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          {bottomNavigationItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                type="button"
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition active:scale-[0.97] ${
                  item.active
                    ? "bg-neutral-950 text-yellow-500"
                    : "text-neutral-500 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Icon size={21} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    </main>
  )
}