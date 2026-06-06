import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  Apple,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  ImageUp,
  LogOut,
  Plus,
  Salad,
  Target,
  Users,
} from "lucide-react"
import {
  getTrainerDashboardAccess,
  type DashboardAccessResponse,
} from "../../services/dashboard.service"
import {
  createTrainerRoutineRequest,
  getTrainerNutritionPlansRequest,
  getTrainerRoutinesRequest,
  getTrainerStudentsRequest,
  removeTrainerStudentRequest,
  saveTrainerNutritionPlanRequest,
  type CreateRoutineExerciseFormData,
  type MembershipStatus,
  type NutritionPlanResponse,
  type RoutineExerciseResponse,
  type SaveNutritionPlanFormData,
  type TrainerStudentResponse,
} from "./trainer.service"
import { getMyProfileRequest } from "../auth/auth.service"
import type { UserProfileResponse } from "../auth/auth.types"
import {
  removeProfilePhotoRequest,
  uploadProfilePhotoRequest,
} from "../profile/profile.service"

type TrainerSection = "students" | "routines" | "nutrition"

const initialRoutineForm: CreateRoutineExerciseFormData = {
  studentId: 0,
  exerciseName: "",
  series: 4,
  repetitions: 12,
}

const initialNutritionForm: SaveNutritionPlanFormData = {
  studentId: 0,
  breakfast: "",
  morningSnack: "",
  lunch: "",
  afternoonSnack: "",
  dinner: "",
}

const sectionItems = [
  { key: "students", label: "Mis alumnos", icon: Users },
  { key: "routines", label: "Rutinas", icon: Dumbbell },
  { key: "nutrition", label: "Alimentación", icon: Salad },
] as const

function formatMembershipStatus(status: MembershipStatus) {
  if (status === "ACTIVA") return "Activa"
  if (status === "POR_VENCER") return "Por vencer"
  if (status === "VENCIDA") return "Vencida"
  if (status === "SIN_MEMBRESIA") return "Sin membresía"
  return "No aplica"
}

function getMembershipStatusClass(status: MembershipStatus) {
  if (status === "ACTIVA") return "bg-emerald-500/10 text-emerald-400"
  if (status === "POR_VENCER") return "bg-yellow-500/10 text-yellow-500"
  if (status === "VENCIDA") return "bg-red-500/10 text-red-400"
  return "bg-neutral-800 text-neutral-400"
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

function buildNutritionForm(
  studentId: number,
  nutritionPlan?: NutritionPlanResponse | null,
): SaveNutritionPlanFormData {
  return {
    studentId,
    breakfast: nutritionPlan?.breakfast ?? "",
    morningSnack: nutritionPlan?.morningSnack ?? "",
    lunch: nutritionPlan?.lunch ?? "",
    afternoonSnack: nutritionPlan?.afternoonSnack ?? "",
    dinner: nutritionPlan?.dinner ?? "",
  }
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

export function TrainerDashboard() {
  const [activeSection, setActiveSection] = useState<TrainerSection>("students")

  const [backendStatus, setBackendStatus] =
    useState<DashboardAccessResponse | null>(null)

  const [students, setStudents] = useState<TrainerStudentResponse[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [studentsError, setStudentsError] = useState("")
  const [studentActionMessage, setStudentActionMessage] = useState("")
  const [studentActionError, setStudentActionError] = useState("")

  const [routines, setRoutines] = useState<RoutineExerciseResponse[]>([])
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true)
  const [routinesError, setRoutinesError] = useState("")

  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlanResponse[]>([])
  const [isLoadingNutritionPlans, setIsLoadingNutritionPlans] = useState(true)
  const [nutritionForm, setNutritionForm] =
    useState<SaveNutritionPlanFormData>(initialNutritionForm)
  const [isSavingNutrition, setIsSavingNutrition] = useState(false)
  const [nutritionMessage, setNutritionMessage] = useState("")
  const [nutritionError, setNutritionError] = useState("")

  const [routineForm, setRoutineForm] =
    useState<CreateRoutineExerciseFormData>(initialRoutineForm)

  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false)
  const [routineMessage, setRoutineMessage] = useState("")
  const [routineError, setRoutineError] = useState("")

  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false)
  const [profilePhotoMessage, setProfilePhotoMessage] = useState("")
  const [profilePhotoError, setProfilePhotoError] = useState("")

  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null)

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

    getTrainerStudentsRequest()
      .then((data) => {
        if (isActive) {
          setStudents(data)
          setStudentsError("")
          setSelectedStudentId((currentSelectedId) => {
            if (currentSelectedId) {
              const stillExists = data.some(
                (student) => student.id === currentSelectedId,
              )

              if (stillExists) {
                return currentSelectedId
              }
            }

            return data[0]?.id ?? null
          })

          setRoutineForm((currentForm) => ({
            ...currentForm,
            studentId: data[0]?.id ?? 0,
          }))

          setNutritionForm((currentForm) => ({
            ...currentForm,
            studentId: data[0]?.id ?? 0,
          }))
        }
      })
      .catch(() => {
        if (isActive) {
          setStudentsError("No se pudieron cargar tus alumnos.")
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

  useEffect(() => {
    let isActive = true

    getTrainerNutritionPlansRequest()
      .then((data) => {
        if (isActive) {
          setNutritionPlans(data)
          setNutritionError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setNutritionError("No se pudieron cargar los planes de alimentación.")
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingNutritionPlans(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  )

  const selectedStudentRoutines = useMemo(() => {
    if (!selectedStudentId) {
      return []
    }

    return routines.filter((routine) => routine.studentId === selectedStudentId)
  }, [routines, selectedStudentId])

  const selectedStudentNutritionPlan = useMemo(() => {
    if (!selectedStudentId) {
      return null
    }

    return (
      nutritionPlans.find((plan) => plan.studentId === selectedStudentId) ?? null
    )
  }, [nutritionPlans, selectedStudentId])

  const completedSelectedRoutines = selectedStudentRoutines.filter(
    (routine) => routine.completed,
  ).length

  const progressPercentage =
    selectedStudentRoutines.length === 0
      ? 0
      : Math.round(
          (completedSelectedRoutines / selectedStudentRoutines.length) * 100,
        )



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

    if (field === "studentId") {
      const studentId = Number(value) || null
      setSelectedStudentId(studentId)

      if (studentId) {
        const existingNutritionPlan = nutritionPlans.find(
          (plan) => plan.studentId === studentId,
        )
        setNutritionForm(buildNutritionForm(studentId, existingNutritionPlan))
      }
    }

    setRoutineMessage("")
    setRoutineError("")
  }

  const handleNutritionFormChange = (
    field: keyof SaveNutritionPlanFormData,
    value: string,
  ) => {
    setNutritionForm((currentForm) => ({
      ...currentForm,
      [field]: field === "studentId" ? Number(value) : value,
    }))

    if (field === "studentId") {
      const studentId = Number(value) || null
      setSelectedStudentId(studentId)

      if (studentId) {
        const existingNutritionPlan = nutritionPlans.find(
          (plan) => plan.studentId === studentId,
        )
        setNutritionForm(buildNutritionForm(studentId, existingNutritionPlan))
      }
    }

    setNutritionMessage("")
    setNutritionError("")
  }

  const handleSelectStudent = (studentId: number) => {
    const existingNutritionPlan = nutritionPlans.find(
      (plan) => plan.studentId === studentId,
    )

    setSelectedStudentId(studentId)
    setRoutineForm((currentForm) => ({
      ...currentForm,
      studentId,
    }))
    setNutritionForm(buildNutritionForm(studentId, existingNutritionPlan))
    setStudentActionMessage("")
    setStudentActionError("")
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
      setRoutineForm({
        ...initialRoutineForm,
        studentId: routineForm.studentId,
      })
      setRoutineMessage("Rutina asignada correctamente.")
    } catch {
      setRoutineError(
        "No se pudo asignar la rutina. Verifica que el alumno pertenezca a tu lista.",
      )
    } finally {
      setIsCreatingRoutine(false)
    }
  }

  const handleSaveNutritionPlan = async () => {
    const hasAnyMeal =
      nutritionForm.breakfast.trim() ||
      nutritionForm.morningSnack.trim() ||
      nutritionForm.lunch.trim() ||
      nutritionForm.afternoonSnack.trim() ||
      nutritionForm.dinner.trim()

    if (!nutritionForm.studentId) {
      setNutritionError("Selecciona un alumno.")
      return
    }

    if (!hasAnyMeal) {
      setNutritionError("Ingresa al menos una comida del plan.")
      return
    }

    try {
      setIsSavingNutrition(true)
      setNutritionError("")
      setNutritionMessage("")

      const savedNutritionPlan = await saveTrainerNutritionPlanRequest({
        studentId: nutritionForm.studentId,
        breakfast: nutritionForm.breakfast.trim(),
        morningSnack: nutritionForm.morningSnack.trim(),
        lunch: nutritionForm.lunch.trim(),
        afternoonSnack: nutritionForm.afternoonSnack.trim(),
        dinner: nutritionForm.dinner.trim(),
      })

      setNutritionPlans((currentPlans) => {
        const exists = currentPlans.some(
          (plan) => plan.id === savedNutritionPlan.id,
        )

        if (exists) {
          return currentPlans.map((plan) =>
            plan.id === savedNutritionPlan.id ? savedNutritionPlan : plan,
          )
        }

        return [savedNutritionPlan, ...currentPlans]
      })

      setNutritionForm(buildNutritionForm(savedNutritionPlan.studentId, savedNutritionPlan))
      setNutritionMessage("Plan de alimentación guardado correctamente.")
    } catch {
      setNutritionError(
        "No se pudo guardar el plan. Verifica que el alumno pertenezca a tu lista.",
      )
    } finally {
      setIsSavingNutrition(false)
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas expulsar este alumno de tu lista?",
    )

    if (!confirmed) {
      return
    }

    try {
      setStudentActionError("")
      setStudentActionMessage("")

      const response = await removeTrainerStudentRequest(studentId)

      const remainingStudents = students.filter(
        (student) => student.id !== studentId,
      )
      const nextStudent = remainingStudents[0] ?? null

      setStudents(remainingStudents)
      setRoutines((currentRoutines) =>
        currentRoutines.filter((routine) => routine.studentId !== studentId),
      )
      setNutritionPlans((currentPlans) =>
        currentPlans.filter((plan) => plan.studentId !== studentId),
      )
      setSelectedStudentId(nextStudent?.id ?? null)
      setRoutineForm((currentForm) => ({
        ...currentForm,
        studentId: nextStudent?.id ?? 0,
      }))
      setNutritionForm(
        nextStudent
          ? buildNutritionForm(
              nextStudent.id,
              nutritionPlans.find((plan) => plan.studentId === nextStudent.id),
            )
          : initialNutritionForm,
      )
      setStudentActionMessage(response.message)
    } catch {
      setStudentActionError("No se pudo expulsar al alumno.")
    }
  }

  const handleProfilePhotoChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      setProfilePhotoError("Usa una imagen JPG, PNG o WEBP.")
      event.target.value = ""
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfilePhotoError("La imagen debe pesar menos de 2MB.")
      event.target.value = ""
      return
    }

    try {
      setIsUploadingProfilePhoto(true)
      setProfilePhotoError("")
      setProfilePhotoMessage("")

      const response = await uploadProfilePhotoRequest(file)

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              profilePhotoUrl: response.profilePhotoUrl,
            }
          : currentProfile,
      )

      setProfilePhotoMessage("Foto de perfil actualizada correctamente.")
    } catch {
      setProfilePhotoError("No se pudo subir la foto.")
    } finally {
      setIsUploadingProfilePhoto(false)
      event.target.value = ""
    }
  }

  const handleRemoveProfilePhoto = async () => {
    const confirmed = window.confirm("¿Deseas quitar tu foto de perfil?")

    if (!confirmed) {
      return
    }

    try {
      setIsUploadingProfilePhoto(true)
      setProfilePhotoError("")
      setProfilePhotoMessage("")

      const response = await removeProfilePhotoRequest()

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              profilePhotoUrl: response.profilePhotoUrl,
            }
          : currentProfile,
      )

      setProfilePhotoMessage("Foto de perfil retirada correctamente.")
    } catch {
      setProfilePhotoError("No se pudo quitar la foto.")
    } finally {
      setIsUploadingProfilePhoto(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pt-24 pb-10 text-white sm:px-6">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
          <p className="text-sm font-semibold text-yellow-500">
            Panel del Entrenador
          </p>

          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">
                Mis alumnos, rutinas y alimentación
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                Gestiona solo los alumnos que te eligieron como coach. Puedes
                asignar ejercicios, revisar progreso y preparar planes de
                alimentación.
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

              <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <ProfileAvatar
                      fullName={profile?.fullName}
                      profilePhotoUrl={profile?.profilePhotoUrl}
                      className="h-16 w-16 shrink-0 rounded-2xl border-2 border-yellow-500"
                      fallbackClassName="flex items-center justify-center bg-yellow-500 text-xl font-black text-black"
                    />

                    <div>
                      <p className="text-sm font-semibold text-yellow-500">
                        Perfil del coach
                      </p>
                      <h2 className="mt-1 text-lg font-black text-white">
                        {profile?.fullName ?? "Entrenador"}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-400">
                        {profile?.email ?? "Cuenta de entrenador"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => profilePhotoInputRef.current?.click()}
                      disabled={isUploadingProfilePhoto}
                      className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ImageUp size={18} />
                      {isUploadingProfilePhoto ? "Subiendo..." : "Subir foto"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveProfilePhoto}
                      disabled={isUploadingProfilePhoto || !profile?.profilePhotoUrl}
                      className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-red-500 hover:text-red-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LogOut size={18} />
                      Quitar
                    </button>
                  </div>
                </div>

                {profilePhotoMessage && (
                  <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                    {profilePhotoMessage}
                  </div>
                )}

                {profilePhotoError && (
                  <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                    {profilePhotoError}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                <p className="text-sm text-neutral-400">Mis alumnos</p>
                <p className="text-2xl font-black">{students.length}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                <p className="text-sm text-neutral-400">Rutinas</p>
                <p className="text-2xl font-black">{routines.length}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                <p className="text-sm text-neutral-400">Alimentación</p>
                <p className="text-2xl font-black">{nutritionPlans.length}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {sectionItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold transition active:scale-[0.98] ${
                  isActive
                    ? "bg-yellow-500 text-black"
                    : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-yellow-500/50 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </section>

        {activeSection === "students" && (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Mis alumnos</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Solo aparecen alumnos que te eligieron como coach.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                  <Users size={24} />
                </div>
              </div>

              {studentActionError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                  {studentActionError}
                </div>
              )}

              {studentActionMessage && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-400">
                  {studentActionMessage}
                </div>
              )}

              {isLoadingStudents && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Cargando alumnos...
                </div>
              )}

              {studentsError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                  {studentsError}
                </div>
              )}

              {!isLoadingStudents && !studentsError && students.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Todavía no tienes alumnos asignados.
                </div>
              )}

              {!isLoadingStudents && !studentsError && students.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {students.map((student) => {
                    const isSelected = selectedStudentId === student.id

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectStudent(student.id)}
                        className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
                          isSelected
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-neutral-800 bg-neutral-950 hover:border-yellow-500/60"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <ProfileAvatar
                            fullName={student.fullName}
                            profilePhotoUrl={student.profilePhotoUrl}
                            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-yellow-500"
                            fallbackClassName="flex items-center justify-center bg-yellow-500 text-xl font-black text-black"
                          />

                          <div>
                            <h3 className="font-bold text-white">
                              {student.fullName}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getMembershipStatusClass(
                              student.membershipStatus,
                            )}`}
                          >
                            {formatMembershipStatus(student.membershipStatus)}
                          </span>

                          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-bold text-neutral-400">
                            Cel: {student.phoneNumber ?? "-"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </article>

            <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <Target size={24} />
                </div>

                <h2 className="text-xl font-black">Detalle del alumno</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Revisa rutinas, alimentación y progreso diario.
                </p>
              </div>

              {!selectedStudent && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Selecciona un alumno para ver su información.
                </div>
              )}

              {selectedStudent && (
                <div>
                  <ProfileAvatar
                    fullName={selectedStudent.fullName}
                    profilePhotoUrl={selectedStudent.profilePhotoUrl}
                    className="mb-4 h-20 w-20 rounded-2xl border-2 border-yellow-500"
                    fallbackClassName="flex items-center justify-center bg-yellow-500 text-2xl font-black text-black"
                  />

                  <h3 className="text-2xl font-black">
                    {selectedStudent.fullName}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-400">
                    {selectedStudent.email}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    Celular: {selectedStudent.phoneNumber ?? "-"}
                  </p>

                  <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <p className="text-sm text-neutral-400">
                      Progreso de rutinas asignadas
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {completedSelectedRoutines}/{selectedStudentRoutines.length}
                    </p>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-yellow-500 transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <p className="mt-2 text-sm text-yellow-500">
                      {progressPercentage}% completado
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <p className="text-sm font-bold text-white">
                      Alimentación asignada
                    </p>

                    {!selectedStudentNutritionPlan && (
                      <p className="mt-2 text-sm text-neutral-400">
                        Este alumno todavía no tiene plan de alimentación.
                      </p>
                    )}

                    {selectedStudentNutritionPlan && (
                      <div className="mt-3 space-y-2 text-sm text-neutral-400">
                        <p>
                          <span className="font-bold text-yellow-500">
                            Desayuno:
                          </span>{" "}
                          {selectedStudentNutritionPlan.breakfast ?? "-"}
                        </p>
                        <p>
                          <span className="font-bold text-yellow-500">
                            Almuerzo:
                          </span>{" "}
                          {selectedStudentNutritionPlan.lunch ?? "-"}
                        </p>
                        <p>
                          <span className="font-bold text-yellow-500">
                            Cena:
                          </span>{" "}
                          {selectedStudentNutritionPlan.dinner ?? "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection("routines")}
                      className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98]"
                    >
                      Asignar nueva rutina
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNutritionForm(
                          buildNutritionForm(
                            selectedStudent.id,
                            selectedStudentNutritionPlan,
                          ),
                        )
                        setActiveSection("nutrition")
                      }}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 font-bold text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-[0.98]"
                    >
                      Crear alimentación
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(selectedStudent.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-bold text-red-400 transition hover:bg-red-500/20 active:scale-[0.98]"
                    >
                      <LogOut size={18} />
                      Expulsar alumno de mi lista
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </section>
        )}

        {activeSection === "routines" && (
          <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <ClipboardList size={24} />
                </div>

                <h2 className="text-xl font-black">Asignar rutina</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Selecciona uno de tus alumnos y registra su ejercicio.
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
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Rutinas asignadas</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Ejercicios asignados a tus alumnos.
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
            </article>
          </section>
        )}

        {activeSection === "nutrition" && (
          <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <Apple size={24} />
                </div>

                <h2 className="text-xl font-black">Plan de alimentación</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Crea o actualiza el plan de alimentación de uno de tus alumnos.
                </p>
              </div>

              <form className="space-y-4">
                <select
                  value={nutritionForm.studentId}
                  onChange={(event) =>
                    handleNutritionFormChange("studentId", event.target.value)
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

                <textarea
                  value={nutritionForm.breakfast}
                  onChange={(event) =>
                    handleNutritionFormChange("breakfast", event.target.value)
                  }
                  placeholder="Desayuno"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                />

                <textarea
                  value={nutritionForm.morningSnack}
                  onChange={(event) =>
                    handleNutritionFormChange("morningSnack", event.target.value)
                  }
                  placeholder="Merienda entre desayuno y almuerzo"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                />

                <textarea
                  value={nutritionForm.lunch}
                  onChange={(event) =>
                    handleNutritionFormChange("lunch", event.target.value)
                  }
                  placeholder="Almuerzo"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                />

                <textarea
                  value={nutritionForm.afternoonSnack}
                  onChange={(event) =>
                    handleNutritionFormChange(
                      "afternoonSnack",
                      event.target.value,
                    )
                  }
                  placeholder="Merienda entre almuerzo y cena"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                />

                <textarea
                  value={nutritionForm.dinner}
                  onChange={(event) =>
                    handleNutritionFormChange("dinner", event.target.value)
                  }
                  placeholder="Cena"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                />

                {nutritionError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                    {nutritionError}
                  </div>
                )}

                {nutritionMessage && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                    {nutritionMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveNutritionPlan}
                  disabled={isSavingNutrition}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={20} />
                  {isSavingNutrition
                    ? "Guardando..."
                    : "Guardar alimentación"}
                </button>
              </form>
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
              <h2 className="text-xl font-black">Planes guardados</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Alimentación registrada por alumno.
              </p>

              {isLoadingNutritionPlans && (
                <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Cargando planes de alimentación...
                </div>
              )}

              {!isLoadingNutritionPlans && nutritionPlans.length === 0 && (
                <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Todavía no hay planes de alimentación guardados.
                </div>
              )}

              {!isLoadingNutritionPlans && nutritionPlans.length > 0 && (
                <div className="mt-5 space-y-4">
                  {nutritionPlans.map((plan) => (
                    <article
                      key={plan.id}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                    >
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-bold text-white">
                            {plan.studentName}
                          </h3>
                          <p className="mt-1 text-xs text-neutral-500">
                            Actualizado: {formatDateTime(plan.updatedAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(plan.studentId)
                            setNutritionForm(buildNutritionForm(plan.studentId, plan))
                          }}
                          className="rounded-xl border border-neutral-800 px-3 py-2 text-xs font-bold text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-95"
                        >
                          Editar
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-neutral-400">
                        <p>
                          <span className="font-bold text-yellow-500">
                            Desayuno:
                          </span>{" "}
                          {plan.breakfast ?? "-"}
                        </p>
                        <p>
                          <span className="font-bold text-yellow-500">
                            Media mañana:
                          </span>{" "}
                          {plan.morningSnack ?? "-"}
                        </p>
                        <p>
                          <span className="font-bold text-yellow-500">
                            Almuerzo:
                          </span>{" "}
                          {plan.lunch ?? "-"}
                        </p>
                        <p>
                          <span className="font-bold text-yellow-500">
                            Media tarde:
                          </span>{" "}
                          {plan.afternoonSnack ?? "-"}
                        </p>
                        <p>
                          <span className="font-bold text-yellow-500">
                            Cena:
                          </span>{" "}
                          {plan.dinner ?? "-"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}
      </section>
    </main>
  )
}
