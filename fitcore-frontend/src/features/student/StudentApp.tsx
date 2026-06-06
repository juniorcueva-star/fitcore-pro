import { type ChangeEvent, useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Home,
  Salad,
  Save,
  Target,
  Trash2,
  Trophy,
  User,
} from "lucide-react"
import {
  getStudentDashboardAccess,
  type DashboardAccessResponse,
} from "../../services/dashboard.service"
import {
  getStudentAttendanceMonthRequest,
  getStudentNutritionPlansRequest,
  getStudentProfileRequest,
  getStudentRoutinesRequest,
  removeStudentProfilePhotoRequest,
  toggleStudentRoutineCompletedRequest,
  updateStudentFitnessGoalRequest,
  uploadStudentProfilePhotoRequest,
  type StudentAttendanceDayResponse,
  type StudentNutritionPlanResponse,
  type StudentProfileResponse,
  type StudentRoutineResponse,
} from "./student.service"

type StudentSection = "home" | "routines" | "nutrition" | "profile"

const bottomNavigationItems = [
  { key: "home", label: "Inicio", icon: Home },
  { key: "routines", label: "Rutina", icon: Dumbbell },
  { key: "nutrition", label: "Nutrición", icon: Salad },
  { key: "profile", label: "Perfil", icon: User },
] as const

const weekDays = ["L", "M", "M", "J", "V", "S", "D"]

function getFirstName(fullName?: string) {
  if (!fullName) return "Alumno"
  return fullName.trim().split(" ")[0]
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function getMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

function getCalendarBlankDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
}

function getAttendanceClass(day: StudentAttendanceDayResponse) {
  if (day.status === "ASISTIO") {
    return "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
  }

  if (day.status === "NO_ASISTIO") {
    return "border-red-500/40 bg-red-500/10 text-red-400"
  }

  return "border-neutral-800 bg-neutral-900 text-neutral-500"
}

function FoodCard({ title, value }: { title: string; value?: string | null }) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-sm font-bold text-yellow-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-300">
        {value || "No asignado todavía."}
      </p>
    </article>
  )
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api"
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "")

function getProfilePhotoSrc(profilePhotoUrl?: string | null) {
  if (!profilePhotoUrl) return null
  if (profilePhotoUrl.startsWith("http://") || profilePhotoUrl.startsWith("https://")) {
    return profilePhotoUrl
  }
  return `${API_ORIGIN}${profilePhotoUrl}`
}

function getInitials(fullName?: string | null) {
  if (!fullName) return "U"

  const words = fullName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return "U"
  if (words.length === 1) return words[0].charAt(0).toUpperCase()

  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
}

function ProfileAvatar({
  fullName,
  profilePhotoUrl,
  className,
  fallbackClassName,
}: {
  fullName?: string | null
  profilePhotoUrl?: string | null
  className: string
  fallbackClassName: string
}) {
  const photoSrc = getProfilePhotoSrc(profilePhotoUrl)

  if (photoSrc) {
    return (
      <img
        src={photoSrc}
        alt={fullName ? `Foto de ${fullName}` : "Foto de perfil"}
        className={`${className} object-cover`}
      />
    )
  }

  return <div className={`${className} ${fallbackClassName}`}>{getInitials(fullName)}</div>
}

export function StudentApp() {
  const [activeSection, setActiveSection] = useState<StudentSection>("home")
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null)
  const [goalInput, setGoalInput] = useState("")
  const [goalMessage, setGoalMessage] = useState("")
  const [goalError, setGoalError] = useState("")
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [photoMessage, setPhotoMessage] = useState("")
  const [photoError, setPhotoError] = useState("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const [backendStatus, setBackendStatus] =
    useState<DashboardAccessResponse | null>(null)

  const [routines, setRoutines] = useState<StudentRoutineResponse[]>([])
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true)
  const [routinesError, setRoutinesError] = useState("")

  const [nutritionPlans, setNutritionPlans] = useState<
    StudentNutritionPlanResponse[]
  >([])
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(true)
  const [nutritionError, setNutritionError] = useState("")

  const now = new Date()
  const [calendarYear, setCalendarYear] = useState(now.getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1)
  const [attendanceDays, setAttendanceDays] = useState<
    StudentAttendanceDayResponse[]
  >([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true)
  const [attendanceError, setAttendanceError] = useState("")

  useEffect(() => {
    let isActive = true

    getStudentProfileRequest()
      .then((data) => {
        if (isActive) {
          setProfile(data)
          setGoalInput(data.fitnessGoal ?? "")
        }
      })
      .catch(() => {
        if (isActive) {
          setProfile(null)
          setGoalInput("")
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

  useEffect(() => {
    let isActive = true

    getStudentNutritionPlansRequest()
      .then((data) => {
        if (isActive) {
          setNutritionPlans(data)
          setNutritionError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setNutritionError("No se pudo cargar tu alimentación.")
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingNutrition(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getStudentAttendanceMonthRequest(calendarYear, calendarMonth)
      .then((data) => {
        if (isActive) {
          setAttendanceDays(data)
          setAttendanceError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setAttendanceError("No se pudo cargar tu calendario de asistencia.")
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingAttendance(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [calendarYear, calendarMonth])

  const completedCount = useMemo(
    () => routines.filter((routine) => routine.completed).length,
    [routines],
  )

  const totalExercises = routines.length

  const progressPercentage =
    totalExercises === 0
      ? 0
      : Math.round((completedCount / totalExercises) * 100)

  const latestNutritionPlan = nutritionPlans[0] ?? null
  const studentFirstName = getFirstName(profile?.fullName)
  const trainerName =
    profile?.coachName ??
    latestNutritionPlan?.trainerName ??
    routines[0]?.trainerName ??
    "Sin entrenador asignado"

  const blankCalendarDays = getCalendarBlankDays(calendarYear, calendarMonth)
  const attendedCount = attendanceDays.filter((day) => day.attended).length
  const missedCount = attendanceDays.filter(
    (day) => day.status === "NO_ASISTIO",
  ).length

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

  const handlePreviousMonth = () => {
    setIsLoadingAttendance(true)
    setAttendanceError("")

    if (calendarMonth === 1) {
      setCalendarMonth(12)
      setCalendarYear((currentYear) => currentYear - 1)
      return
    }

    setCalendarMonth((currentMonth) => currentMonth - 1)
  }

  const handleNextMonth = () => {
    setIsLoadingAttendance(true)
    setAttendanceError("")

    if (calendarMonth === 12) {
      setCalendarMonth(1)
      setCalendarYear((currentYear) => currentYear + 1)
      return
    }

    setCalendarMonth((currentMonth) => currentMonth + 1)
  }

  const handleSaveGoal = async () => {
    const fitnessGoal = goalInput.trim()

    if (!fitnessGoal) {
      setGoalError("Escribe tu objetivo fitness.")
      setGoalMessage("")
      return
    }

    try {
      setIsSavingGoal(true)
      setGoalError("")
      setGoalMessage("")

      const updatedProfile = await updateStudentFitnessGoalRequest(fitnessGoal)

      setProfile(updatedProfile)
      setGoalInput(updatedProfile.fitnessGoal ?? "")
      setGoalMessage("Objetivo actualizado correctamente.")
    } catch {
      setGoalError("No se pudo actualizar tu objetivo.")
    } finally {
      setIsSavingGoal(false)
    }
  }

  const handleUploadProfilePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0]

    if (!photo) return

    try {
      setIsUploadingPhoto(true)
      setPhotoError("")
      setPhotoMessage("")

      const response = await uploadStudentProfilePhotoRequest(photo)

      setProfile((currentProfile) =>
        currentProfile
          ? { ...currentProfile, profilePhotoUrl: response.profilePhotoUrl }
          : currentProfile,
      )
      setPhotoMessage("Foto de perfil actualizada correctamente.")
    } catch {
      setPhotoError("No se pudo subir la foto. Usa JPG, PNG o WEBP menor a 2MB.")
    } finally {
      setIsUploadingPhoto(false)
      event.target.value = ""
    }
  }

  const handleRemoveProfilePhoto = async () => {
    try {
      setIsUploadingPhoto(true)
      setPhotoError("")
      setPhotoMessage("")

      await removeStudentProfilePhotoRequest()

      setProfile((currentProfile) =>
        currentProfile ? { ...currentProfile, profilePhotoUrl: null } : currentProfile,
      )
      setPhotoMessage("Foto de perfil eliminada correctamente.")
    } catch {
      setPhotoError("No se pudo eliminar la foto de perfil.")
    } finally {
      setIsUploadingPhoto(false)
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
          </div>

          <ProfileAvatar
            fullName={profile?.fullName}
            profilePhotoUrl={profile?.profilePhotoUrl}
            className="h-14 w-14 shrink-0 rounded-full border-2 border-yellow-500"
            fallbackClassName="flex items-center justify-center bg-neutral-900 text-xl font-black text-yellow-500"
          />
        </header>

        {activeSection === "home" && (
          <section>
            {backendStatus && (
              <div className="mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <p className="text-sm font-bold text-yellow-500">
                  {backendStatus.message}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Usuario: {backendStatus.user}
                </p>
              </div>
            )}

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
                    Rutinas y alimentación desde fitness world 7
                  </p>
                </div>
              </div>
            </article>

            <article className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Mi objetivo</p>
                  <h2 className="mt-1 text-xl font-black text-yellow-500">
                    {profile?.fitnessGoal || "Sin objetivo registrado"}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <Target size={24} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection("profile")}
                className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-[0.98]"
              >
                Editar objetivo
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
                Avance actual: {" "}
                <span className="font-bold text-yellow-500">
                  {progressPercentage}%
                </span>
              </p>
            </article>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveSection("routines")}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left transition hover:border-yellow-500/60 active:scale-[0.98]"
              >
                <Dumbbell className="text-yellow-500" size={24} />
                <p className="mt-3 text-sm font-bold">Rutinas</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("nutrition")}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left transition hover:border-yellow-500/60 active:scale-[0.98]"
              >
                <Salad className="text-yellow-500" size={24} />
                <p className="mt-3 text-sm font-bold">Nutrición</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("profile")}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left transition hover:border-yellow-500/60 active:scale-[0.98]"
              >
                <CalendarDays className="text-yellow-500" size={24} />
                <p className="mt-3 text-sm font-bold">Asistencia</p>
              </button>
            </div>
          </section>
        )}

        {activeSection === "routines" && (
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
        )}

        {activeSection === "nutrition" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Mi Alimentación</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Plan asignado por tu entrenador.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
                <Salad size={22} />
              </div>
            </div>

            {isLoadingNutrition && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                Cargando alimentación...
              </div>
            )}

            {nutritionError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                {nutritionError}
              </div>
            )}

            {!isLoadingNutrition && !nutritionError && !latestNutritionPlan && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                Todavía no tienes un plan de alimentación asignado.
              </div>
            )}

            {!isLoadingNutrition && !nutritionError && latestNutritionPlan && (
              <div className="space-y-4">
                <article className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-sm text-neutral-400">Entrenador</p>
                  <h3 className="mt-1 text-xl font-black text-yellow-500">
                    {latestNutritionPlan.trainerName}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-400">
                    Última actualización: {formatDateTime(latestNutritionPlan.updatedAt)}
                  </p>
                </article>

                <FoodCard title="Desayuno" value={latestNutritionPlan.breakfast} />
                <FoodCard
                  title="Merienda media mañana"
                  value={latestNutritionPlan.morningSnack}
                />
                <FoodCard title="Almuerzo" value={latestNutritionPlan.lunch} />
                <FoodCard
                  title="Merienda media tarde"
                  value={latestNutritionPlan.afternoonSnack}
                />
                <FoodCard title="Cena" value={latestNutritionPlan.dinner} />
              </div>
            )}
          </section>
        )}

        {activeSection === "profile" && (
          <section className="space-y-5">
            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
              <ProfileAvatar
                fullName={profile?.fullName}
                profilePhotoUrl={profile?.profilePhotoUrl}
                className="mb-4 h-20 w-20 rounded-2xl border-2 border-yellow-500"
                fallbackClassName="flex items-center justify-center bg-yellow-500 text-2xl font-black text-black"
              />

              <h2 className="text-2xl font-black">
                {profile?.fullName ?? "Alumno"}
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                {profile?.email ?? "Correo no disponible"}
              </p>
              <p className="mt-2 text-sm text-yellow-500">
                Rol: {profile?.role ?? "STUDENT"}
              </p>
              <div className="mt-5 space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm font-bold text-white">Foto de perfil</p>
                <p className="text-xs leading-5 text-neutral-500">
                  Es opcional. Si no subes una foto, se mostrarán tus iniciales.
                </p>

                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98]">
                  <Camera size={18} />
                  {isUploadingPhoto ? "Procesando..." : "Subir foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUploadProfilePhoto}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>

                {profile?.profilePhotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePhoto}
                    disabled={isUploadingPhoto}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={18} />
                    Quitar foto
                  </button>
                )}

                {photoError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                    {photoError}
                  </div>
                )}

                {photoMessage && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                    {photoMessage}
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-neutral-400">
                DNI: {profile?.dni ?? "-"} · Celular: {profile?.phoneNumber ?? "-"}
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                Membresía: {profile?.membershipStatus ?? "-"}
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                Vence: {formatDate(profile?.membershipEndDate)}
              </p>
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Objetivo Fitness</p>
                  <h3 className="mt-1 text-xl font-black text-yellow-500">
                    {profile?.fitnessGoal || "Sin objetivo registrado"}
                  </h3>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <Target size={22} />
                </div>
              </div>

              <textarea
                value={goalInput}
                onChange={(event) => {
                  setGoalInput(event.target.value)
                  setGoalError("")
                  setGoalMessage("")
                }}
                rows={3}
                placeholder="Ej. Bajar 10 kg, ganar masa muscular..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
              />

              {goalError && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                  {goalError}
                </div>
              )}

              {goalMessage && (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                  {goalMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={isSavingGoal}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={19} />
                {isSavingGoal ? "Guardando..." : "Guardar objetivo"}
              </button>
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">Calendario de asistencia</h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Verde asistió, rojo no asistió, gris futuro.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <CalendarDays size={22} />
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>

                <p className="text-center text-sm font-bold capitalize text-white">
                  {getMonthLabel(calendarYear, calendarMonth)}
                </p>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-center font-bold text-emerald-400">
                  Asistió: {attendedCount}
                </span>
                <span className="rounded-full bg-red-500/10 px-2 py-1 text-center font-bold text-red-400">
                  No asistió: {missedCount}
                </span>
                <span className="rounded-full bg-neutral-800 px-2 py-1 text-center font-bold text-neutral-400">
                  Futuro
                </span>
              </div>

              {isLoadingAttendance && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Cargando calendario...
                </div>
              )}

              {attendanceError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                  {attendanceError}
                </div>
              )}

              {!isLoadingAttendance && !attendanceError && (
                <>
                  <div className="mb-2 grid grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-bold text-neutral-500"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: blankCalendarDays }).map((_, index) => (
                      <div key={`blank-${index}`} />
                    ))}

                    {attendanceDays.map((day) => {
                      const dayNumber = Number(day.date.slice(8, 10))

                      return (
                        <div
                          key={day.date}
                          className={`flex h-10 items-center justify-center rounded-xl border text-sm font-black ${getAttendanceClass(
                            day,
                          )}`}
                          title={day.status}
                        >
                          {dayNumber}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </article>
          </section>
        )}
      </section>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-neutral-800 bg-neutral-900/95 px-3 py-3 shadow-2xl backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          {bottomNavigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition active:scale-[0.97] ${
                  isActive
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
