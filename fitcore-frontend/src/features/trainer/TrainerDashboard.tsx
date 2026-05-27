import { useEffect, useState } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Plus,
  Target,
  Users,
} from "lucide-react"
import {
  getTrainerDashboardAccess,
  type DashboardAccessResponse,
} from "../../services/dashboard.service"
import {
  createTrainerRoutineRequest,
  getTrainerRoutinesRequest,
  getTrainerStudentsRequest,
  type CreateRoutineExerciseFormData,
  type RoutineExerciseResponse,
  type TrainerStudentResponse,
} from "./trainer.service"

const initialRoutineForm: CreateRoutineExerciseFormData = {
  studentId: 0,
  exerciseName: "",
  series: 4,
  repetitions: 12,
}

export function TrainerDashboard() {
  const [backendStatus, setBackendStatus] =
    useState<DashboardAccessResponse | null>(null)

  const [students, setStudents] = useState<TrainerStudentResponse[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [studentsError, setStudentsError] = useState("")

  const [routines, setRoutines] = useState<RoutineExerciseResponse[]>([])
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true)
  const [routinesError, setRoutinesError] = useState("")

  const [routineForm, setRoutineForm] =
    useState<CreateRoutineExerciseFormData>(initialRoutineForm)

  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false)
  const [routineMessage, setRoutineMessage] = useState("")
  const [routineError, setRoutineError] = useState("")

  useEffect(() => {
    let isActive = true

    getTrainerDashboardAccess()
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

    getTrainerStudentsRequest()
      .then((data) => {
        if (isActive) {
          setStudents(data)
          setStudentsError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setStudentsError("No se pudieron cargar los alumnos reales.")
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingStudents(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getTrainerRoutinesRequest()
      .then((data) => {
        if (isActive) {
          setRoutines(data)
          setRoutinesError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setRoutinesError("No se pudieron cargar las rutinas asignadas.")
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

  const handleRoutineFormChange = (
    field: keyof CreateRoutineExerciseFormData,
    value: string,
  ) => {
    setRoutineForm((currentForm) => ({
      ...currentForm,
      [field]:
        field === "studentId" || field === "series" || field === "repetitions"
          ? Number(value)
          : value,
    }))

    setRoutineMessage("")
    setRoutineError("")
  }

  const handleCreateRoutine = async () => {
    const exerciseName = routineForm.exerciseName.trim()

    if (!routineForm.studentId) {
      setRoutineError("Selecciona un alumno.")
      return
    }

    if (!exerciseName) {
      setRoutineError("Ingresa el nombre del ejercicio.")
      return
    }

    if (routineForm.series < 1 || routineForm.repetitions < 1) {
      setRoutineError("Series y repeticiones deben ser mayores a 0.")
      return
    }

    try {
      setIsCreatingRoutine(true)
      setRoutineError("")
      setRoutineMessage("")

      const newRoutine = await createTrainerRoutineRequest({
        studentId: routineForm.studentId,
        exerciseName,
        series: routineForm.series,
        repetitions: routineForm.repetitions,
      })

      setRoutines((currentRoutines) => [newRoutine, ...currentRoutines])
      setRoutineForm(initialRoutineForm)
      setRoutineMessage("Rutina asignada correctamente.")
    } catch {
      setRoutineError("No se pudo asignar la rutina.")
    } finally {
      setIsCreatingRoutine(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pt-24 pb-10 text-white sm:px-6">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
          <p className="text-sm font-semibold text-yellow-500">
            Panel del Entrenador
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">
                Gestión de Alumnos y Rutinas
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                Administra alumnos reales registrados en PostgreSQL y asigna
                rutinas personalizadas desde el panel.
              </p>

              {backendStatus && (
                <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                  <p className="text-sm font-bold text-yellow-500">
                    {backendStatus.message}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Usuario autenticado: {backendStatus.user}
                  </p>
                </div>
              )}
            </div>

            <div className="flex w-full items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 md:w-auto md:px-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
                <Users size={24} />
              </div>

              <div>
                <p className="text-sm text-neutral-400">Mis Alumnos</p>
                <p className="text-2xl font-black">
                  {students.length} asignados
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Alumnos Reales</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Alumnos activos creados desde el panel Admin.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                <Dumbbell size={24} />
              </div>
            </div>

            {isLoadingStudents && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                Cargando alumnos reales...
              </div>
            )}

            {studentsError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                {studentsError}
              </div>
            )}

            {!isLoadingStudents && !studentsError && students.length === 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                No hay alumnos activos registrados todavía.
              </div>
            )}

            {!isLoadingStudents && !studentsError && students.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition hover:-translate-y-1 hover:border-yellow-500/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-xl font-black text-black">
                        {student.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-bold text-white">
                          {student.fullName}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-400">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2">
                      <Target size={17} className="text-yellow-500" />
                      <span className="text-xs font-semibold text-neutral-400">
                        Objetivo: {student.goal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <ClipboardList size={24} />
                </div>

                <h2 className="text-xl font-black">Asignar Rutina</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Selecciona un alumno real y registra su ejercicio.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-300">
                    Alumno
                  </label>

                  <select
                    value={routineForm.studentId}
                    onChange={(event) =>
                      handleRoutineFormChange("studentId", event.target.value)
                    }
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value={0}>Selecciona un alumno</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-300">
                    Nombre del Ejercicio
                  </label>

                  <input
                    type="text"
                    value={routineForm.exerciseName}
                    onChange={(event) =>
                      handleRoutineFormChange("exerciseName", event.target.value)
                    }
                    placeholder="Ej. Press de banca"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-300">
                      Series
                    </label>

                    <input
                      type="number"
                      value={routineForm.series}
                      onChange={(event) =>
                        handleRoutineFormChange("series", event.target.value)
                      }
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-300">
                      Repeticiones
                    </label>

                    <input
                      type="number"
                      value={routineForm.repetitions}
                      onChange={(event) =>
                        handleRoutineFormChange(
                          "repetitions",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                    />
                  </div>
                </div>

                {routineError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                    {routineError}
                  </div>
                )}

                {routineMessage && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                    {routineMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCreateRoutine}
                  disabled={isCreatingRoutine}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={20} />
                  {isCreatingRoutine ? "Asignando..." : "Asignar Rutina"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Rutinas Asignadas</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Ejercicios guardados en PostgreSQL.
                </p>
              </div>

              {isLoadingRoutines && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Cargando rutinas...
                </div>
              )}

              {routinesError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                  {routinesError}
                </div>
              )}

              {!isLoadingRoutines && !routinesError && routines.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Todavía no asignaste rutinas.
                </div>
              )}

              {!isLoadingRoutines && !routinesError && routines.length > 0 && (
                <div className="space-y-3">
                  {routines.map((routine) => (
                    <article
                      key={routine.id}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white">
                            {routine.exerciseName}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-400">
                            Alumno: {routine.studentName}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {routine.series} Series x {routine.repetitions} Reps
                          </p>
                        </div>

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            routine.completed
                              ? "bg-emerald-500 text-white"
                              : "bg-yellow-500 text-black"
                          }`}
                        >
                          <CheckCircle2 size={20} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </section>
      </section>
    </main>
  )
}