import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  Filter,
  LogIn,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"
import { adminMetrics } from "../../data/mockData"
import {
  getAdminDashboardAccess,
  type DashboardAccessResponse,
} from "../../services/dashboard.service"
import {
  createAdminUserRequest,
  deleteAdminUserRequest,
  getAdminAttendancesRequest,
  getAdminUsersRequest,
  registerAttendanceByDniRequest,
  toggleAdminUserActiveRequest,
  updateAdminUserRequest,
  type AdminUserResponse,
  type AttendanceResponse,
  type CreateUserFormData,
  type MembershipPlan,
  type MembershipStatus,
  type UpdateUserFormData,
} from "./admin.service"
import type { UserRole } from "../auth/auth.types"

type RoleFilter = "ALL" | UserRole
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"
type MembershipFilter = "ALL" | MembershipStatus

type CreateUserFormState = {
  fullName: string
  email: string
  password: string
  role: UserRole
  dni: string
  phoneNumber: string
  membershipPlan: MembershipPlan
  membershipAmount: string
  membershipStartDate: string
}

type EditUserFormState = {
  fullName: string
  email: string
  role: UserRole
  active: boolean
  dni: string
  phoneNumber: string
  membershipPlan: MembershipPlan
  membershipAmount: string
  membershipStartDate: string
}

const sidebarItems = [
  { label: "Dashboard", icon: BarChart3, active: true },
  { label: "Alumnos", icon: Users, active: false },
  { label: "Entrenadores", icon: Shield, active: false },
  { label: "Asistencias", icon: LogIn, active: false },
]

const metricIcons = [Users, AlertTriangle, Wallet]

const today = new Date().toISOString().slice(0, 10)

const initialCreateUserForm: CreateUserFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "STUDENT",
  dni: "",
  phoneNumber: "",
  membershipPlan: "MENSUAL",
  membershipAmount: "120",
  membershipStartDate: today,
}

function formatRole(role: string) {
  if (role === "ADMIN") return "Administrador"
  if (role === "TRAINER") return "Entrenador"
  return "Alumno"
}

function formatPlan(plan?: MembershipPlan | null) {
  if (!plan) return "Sin plan"
  if (plan === "LIBRE") return "Libre"
  if (plan === "MENSUAL") return "1 mes"
  if (plan === "TRIMESTRAL") return "3 meses"
  if (plan === "SEMESTRAL") return "6 meses"
  return "1 año"
}

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

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value)
}

function buildCreatePayload(form: CreateUserFormState): CreateUserFormData {
  const isStudent = form.role === "STUDENT"

  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password.trim(),
    role: form.role,
    dni: isStudent ? form.dni.trim() : null,
    phoneNumber: isStudent ? form.phoneNumber.trim() : null,
    membershipPlan: isStudent ? form.membershipPlan : null,
    membershipAmount: isStudent ? Number(form.membershipAmount) : null,
    membershipStartDate: isStudent ? form.membershipStartDate : null,
  }
}

function buildUpdatePayload(form: EditUserFormState): UpdateUserFormData {
  const isStudent = form.role === "STUDENT"

  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    role: form.role,
    active: form.active,
    dni: isStudent ? form.dni.trim() : null,
    phoneNumber: isStudent ? form.phoneNumber.trim() : null,
    membershipPlan: isStudent ? form.membershipPlan : null,
    membershipAmount: isStudent ? Number(form.membershipAmount) : null,
    membershipStartDate: isStudent ? form.membershipStartDate : null,
  }
}

export function AdminDashboard() {
  const [backendStatus, setBackendStatus] =
    useState<DashboardAccessResponse | null>(null)

  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState("")

  const [attendances, setAttendances] = useState<AttendanceResponse[]>([])
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(true)
  const [attendanceDni, setAttendanceDni] = useState("")
  const [attendanceMessage, setAttendanceMessage] = useState("")
  const [attendanceError, setAttendanceError] = useState("")
  const [isRegisteringAttendance, setIsRegisteringAttendance] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [membershipFilter, setMembershipFilter] =
    useState<MembershipFilter>("ALL")

  const [createUserForm, setCreateUserForm] =
    useState<CreateUserFormState>(initialCreateUserForm)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [createUserMessage, setCreateUserMessage] = useState("")
  const [createUserError, setCreateUserError] = useState("")

  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null)
  const [editUserForm, setEditUserForm] = useState<EditUserFormState | null>(
    null,
  )
  const [editMessage, setEditMessage] = useState("")
  const [editError, setEditError] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(() => {
    let isActive = true

    getAdminDashboardAccess()
      .then((data) => {
        if (isActive) setBackendStatus(data)
      })
      .catch(() => {
        if (isActive) setBackendStatus(null)
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getAdminUsersRequest()
      .then((data) => {
        if (isActive) {
          setUsers(data)
          setUsersError("")
        }
      })
      .catch(() => {
        if (isActive) {
          setUsersError("No se pudieron cargar los usuarios reales.")
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingUsers(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getAdminAttendancesRequest()
      .then((data) => {
        if (isActive) {
          setAttendances(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setAttendances([])
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingAttendances(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const students = users.filter((user) => user.role === "STUDENT")

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.dni ?? "").includes(normalizedSearch) ||
        (user.phoneNumber ?? "").includes(normalizedSearch)

      const matchesRole =
        roleFilter === "ALL" ? true : user.role === roleFilter

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? user.active
            : !user.active

      const matchesMembership =
        membershipFilter === "ALL"
          ? true
          : user.membershipStatus === membershipFilter

      return matchesSearch && matchesRole && matchesStatus && matchesMembership
    })
  }, [users, searchTerm, roleFilter, statusFilter, membershipFilter])

  const realMetrics = useMemo(() => {
    const activeStudentsCount = students.filter(
      (user) => user.membershipStatus === "ACTIVA",
    ).length

    const expiringStudentsCount = students.filter(
      (user) => user.membershipStatus === "POR_VENCER",
    ).length

    const totalIncome = students.reduce((total, user) => {
      return total + (user.membershipAmount ?? 0)
    }, 0)

    return [
      {
        title: "Alumnos Activos",
        value: String(activeStudentsCount),
        description: "Con membresía activa",
      },
      {
        title: "Por vencer",
        value: String(expiringStudentsCount),
        description: "Vencen en 5 días o menos",
      },
      {
        title: "Ingresos Registrados",
        value: formatMoney(totalIncome),
        description: "Suma de membresías registradas",
      },
    ]
  }, [students])

  const metricsToShow = users.length > 0 ? realMetrics : adminMetrics

  const studentsExpiring = students.filter(
    (user) => user.membershipStatus === "POR_VENCER",
  )

  const studentsExpired = students.filter(
    (user) => user.membershipStatus === "VENCIDA",
  )

  const recentAttendances = attendances.slice(0, 6)

  const handleCreateUserChange = (
    field: keyof CreateUserFormState,
    value: string,
  ) => {
    setCreateUserForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

    setCreateUserMessage("")
    setCreateUserError("")
  }

  const handleCreateUser = async () => {
    const payload = buildCreatePayload(createUserForm)

    if (!payload.fullName || !payload.email || !payload.password) {
      setCreateUserError("Completa nombre, correo y contraseña.")
      return
    }

    if (payload.password.length < 6) {
      setCreateUserError("La contraseña debe tener mínimo 6 caracteres.")
      return
    }

    if (payload.role === "STUDENT") {
      if (!payload.dni || !payload.phoneNumber) {
        setCreateUserError("Para alumnos debes ingresar DNI y celular.")
        return
      }

      if (!payload.membershipPlan || !payload.membershipAmount) {
        setCreateUserError("Para alumnos debes ingresar plan y monto.")
        return
      }

      if (!payload.membershipStartDate) {
        setCreateUserError("Selecciona la fecha de inicio de membresía.")
        return
      }
    }

    try {
      setIsCreatingUser(true)
      setCreateUserError("")
      setCreateUserMessage("")

      const newUser = await createAdminUserRequest(payload)

      setUsers((currentUsers) => [...currentUsers, newUser])
      setCreateUserForm(initialCreateUserForm)
      setCreateUserMessage("Usuario creado correctamente.")
    } catch {
      setCreateUserError("No se pudo crear el usuario. Revisa correo o DNI.")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleRegisterAttendance = async () => {
    const dni = attendanceDni.trim()

    if (!/^\d{8}$/.test(dni)) {
      setAttendanceError("Ingresa un DNI válido de 8 dígitos.")
      setAttendanceMessage("")
      return
    }

    try {
      setIsRegisteringAttendance(true)
      setAttendanceError("")
      setAttendanceMessage("")

      const newAttendance = await registerAttendanceByDniRequest(dni)

      setAttendances((currentAttendances) => [
        newAttendance,
        ...currentAttendances,
      ])

      setAttendanceDni("")
      setAttendanceMessage(
        `Ingreso registrado: ${newAttendance.studentName}`,
      )
    } catch {
      setAttendanceError(
        "No se pudo registrar el ingreso. Verifica DNI o membresía.",
      )
    } finally {
      setIsRegisteringAttendance(false)
    }
  }

  const startEditingUser = (user: AdminUserResponse) => {
    setEditingUser(user)
    setEditUserForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
      dni: user.dni ?? "",
      phoneNumber: user.phoneNumber ?? "",
      membershipPlan: user.membershipPlan ?? "MENSUAL",
      membershipAmount: String(user.membershipAmount ?? ""),
      membershipStartDate: user.membershipStartDate ?? today,
    })
    setEditMessage("")
    setEditError("")
  }

  const cancelEditingUser = () => {
    setEditingUser(null)
    setEditUserForm(null)
    setEditMessage("")
    setEditError("")
  }

  const handleEditUserChange = (
    field: keyof EditUserFormState,
    value: string | boolean,
  ) => {
    setEditUserForm((currentForm) => {
      if (!currentForm) return currentForm

      return {
        ...currentForm,
        [field]: value,
      }
    })

    setEditMessage("")
    setEditError("")
  }

  const handleSaveEditUser = async () => {
    if (!editingUser || !editUserForm) return

    const payload = buildUpdatePayload(editUserForm)

    if (!payload.fullName || !payload.email) {
      setEditError("Completa nombre y correo.")
      return
    }

    if (payload.role === "STUDENT") {
      if (!payload.dni || !payload.phoneNumber) {
        setEditError("Para alumnos debes ingresar DNI y celular.")
        return
      }

      if (!payload.membershipPlan || !payload.membershipAmount) {
        setEditError("Para alumnos debes ingresar plan y monto.")
        return
      }

      if (!payload.membershipStartDate) {
        setEditError("Selecciona la fecha de inicio de membresía.")
        return
      }
    }

    try {
      setIsSavingEdit(true)
      setEditError("")
      setEditMessage("")

      const updatedUser = await updateAdminUserRequest(editingUser.id, payload)

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      )

      setEditingUser(updatedUser)
      setEditUserForm({
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        active: updatedUser.active,
        dni: updatedUser.dni ?? "",
        phoneNumber: updatedUser.phoneNumber ?? "",
        membershipPlan: updatedUser.membershipPlan ?? "MENSUAL",
        membershipAmount: String(updatedUser.membershipAmount ?? ""),
        membershipStartDate: updatedUser.membershipStartDate ?? today,
      })
      setEditMessage("Usuario actualizado correctamente.")
    } catch {
      setEditError("No se pudo actualizar el usuario.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleToggleUserActive = async (userId: number) => {
    try {
      const updatedUser = await toggleAdminUserActiveRequest(userId)

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      )

      if (editingUser?.id === updatedUser.id) {
        setEditingUser(updatedUser)
      }
    } catch {
      setUsersError("No se pudo cambiar el estado del usuario.")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este usuario?",
    )

    if (!confirmed) return

    try {
      await deleteAdminUserRequest(userId)

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )

      if (editingUser?.id === userId) {
        cancelEditingUser()
      }
    } catch {
      setUsersError("No se pudo eliminar el usuario.")
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 pt-24 text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-10 sm:px-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 lg:block">
          <div className="mb-8">
            <h2 className="text-2xl font-black">
              FitCore <span className="text-yellow-500">Pro</span>
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Panel administrativo
            </p>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] ${
                    item.active
                      ? "bg-yellow-500 text-black"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5">
            <p className="text-sm font-semibold text-yellow-500">
              Panel del Administrador
            </p>

            <h1 className="mt-1 text-2xl font-black sm:text-3xl">
              Dashboard del Gimnasio
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Control de alumnos, entrenadores, membresías, pagos, vencimientos
              e ingresos.
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
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metricsToShow.map((metric, index) => {
              const Icon = metricIcons[index]

              return (
                <article
                  key={metric.title}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl transition hover:border-yellow-500/50"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-400">
                      Real
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-400">
                    {metric.title}
                  </h3>
                  <p className="mt-2 text-3xl font-black">{metric.value}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    {metric.description}
                  </p>
                </article>
              )
            })}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
              <div className="mb-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
                  <LogIn size={22} />
                </div>

                <h2 className="text-lg font-black">Registrar ingreso</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Ingresa el DNI del alumno para marcar su entrada al gimnasio.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={attendanceDni}
                  onChange={(event) => {
                    setAttendanceDni(event.target.value)
                    setAttendanceError("")
                    setAttendanceMessage("")
                  }}
                  placeholder="DNI del alumno"
                  maxLength={8}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                />

                {attendanceError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                    {attendanceError}
                  </div>
                )}

                {attendanceMessage && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                    {attendanceMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRegisterAttendance}
                  disabled={isRegisteringAttendance}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={20} />
                  {isRegisteringAttendance
                    ? "Registrando..."
                    : "Registrar ingreso"}
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black">Últimos ingresos</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Historial reciente de asistencia al gimnasio.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                  <Clock size={22} />
                </div>
              </div>

              {isLoadingAttendances && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Cargando asistencias...
                </div>
              )}

              {!isLoadingAttendances && recentAttendances.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Todavía no hay ingresos registrados.
                </div>
              )}

              {!isLoadingAttendances && recentAttendances.length > 0 && (
                <div className="space-y-3">
                  {recentAttendances.map((attendance) => (
                    <div
                      key={attendance.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-white">
                            {attendance.studentName}
                          </p>
                          <p className="mt-1 text-sm text-neutral-400">
                            DNI: {attendance.dni} | Cel:{" "}
                            {attendance.phoneNumber ?? "-"}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getMembershipStatusClass(
                            attendance.membershipStatus,
                          )}`}
                        >
                          {formatMembershipStatus(
                            attendance.membershipStatus,
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-neutral-500">
                        Ingreso: {formatDateTime(attendance.checkInAt)} · Total
                        asistencias: {attendance.totalAttendances}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
              <h2 className="text-lg font-black">Membresías por vencer</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Alumnos que vencen en 5 días o menos.
              </p>

              <div className="mt-4 space-y-3">
                {studentsExpiring.length === 0 && (
                  <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                    No hay membresías por vencer.
                  </p>
                )}

                {studentsExpiring.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4"
                  >
                    <p className="font-bold text-yellow-500">
                      {student.fullName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      DNI: {student.dni} | Cel: {student.phoneNumber}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Vence: {formatDate(student.membershipEndDate)}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
              <h2 className="text-lg font-black">No renovados / vencidos</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Alumnos con membresía vencida.
              </p>

              <div className="mt-4 space-y-3">
                {studentsExpired.length === 0 && (
                  <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                    No hay alumnos vencidos.
                  </p>
                )}

                {studentsExpired.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                  >
                    <p className="font-bold text-red-400">
                      {student.fullName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      DNI: {student.dni} | Cel: {student.phoneNumber}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Venció: {formatDate(student.membershipEndDate)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
            <article className="min-w-0 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Alumnos y Usuarios Matriculados
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Busca por nombre, correo, DNI o celular.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                  <CalendarDays size={22} />
                </div>
              </div>

              <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_150px_160px_170px]">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <Search size={18} className="text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3">
                  <Filter size={17} className="text-neutral-500" />
                  <select
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(event.target.value as RoleFilter)
                    }
                    className="w-full bg-transparent text-sm text-white outline-none"
                  >
                    <option value="ALL">Todos</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TRAINER">Entrenador</option>
                    <option value="STUDENT">Alumno</option>
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="ALL">Estado: Todos</option>
                  <option value="ACTIVE">Activos</option>
                  <option value="INACTIVE">Inactivos</option>
                </select>

                <select
                  value={membershipFilter}
                  onChange={(event) =>
                    setMembershipFilter(event.target.value as MembershipFilter)
                  }
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="ALL">Membresía: Todas</option>
                  <option value="ACTIVA">Activas</option>
                  <option value="POR_VENCER">Por vencer</option>
                  <option value="VENCIDA">Vencidas</option>
                  <option value="SIN_MEMBRESIA">Sin membresía</option>
                </select>
              </div>

              <div className="mb-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs font-semibold text-neutral-400">
                Mostrando{" "}
                <span className="text-yellow-500">{filteredUsers.length}</span>{" "}
                de <span className="text-white">{users.length}</span> usuarios.
              </div>

              {isLoadingUsers && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  Cargando usuarios reales...
                </div>
              )}

              {usersError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                  {usersError}
                </div>
              )}

              {!isLoadingUsers && !usersError && filteredUsers.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table
                    className="w-full text-left text-sm"
                    style={{ minWidth: "1150px" }}
                  >
                    <thead className="bg-neutral-950">
                      <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Nombre</th>
                        <th className="px-4 py-3 font-semibold">DNI</th>
                        <th className="px-4 py-3 font-semibold">Celular</th>
                        <th className="px-4 py-3 font-semibold">Correo</th>
                        <th className="px-4 py-3 font-semibold">Rol</th>
                        <th className="px-4 py-3 font-semibold">Plan</th>
                        <th className="px-4 py-3 font-semibold">Pago</th>
                        <th className="px-4 py-3 font-semibold">Vence</th>
                        <th className="px-4 py-3 font-semibold">Membresía</th>
                        <th className="px-4 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-neutral-800/70 last:border-b-0"
                        >
                          <td className="px-4 py-4 font-semibold text-neutral-400">
                            #{user.id}
                          </td>
                          <td className="px-4 py-4 font-semibold text-white">
                            {user.fullName}
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {user.dni ?? "-"}
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {user.phoneNumber ?? "-"}
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {user.email}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {formatPlan(user.membershipPlan)}
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {formatMoney(user.membershipAmount)}
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {formatDate(user.membershipEndDate)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getMembershipStatusClass(
                                user.membershipStatus,
                              )}`}
                            >
                              {formatMembershipStatus(user.membershipStatus)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditingUser(user)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-95"
                                aria-label="Editar usuario"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleUserActive(user.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 transition hover:border-yellow-500 hover:text-yellow-500 active:scale-95"
                                aria-label="Activar o inactivar usuario"
                              >
                                <Shield size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 transition hover:border-red-500 hover:text-red-400 active:scale-95"
                                aria-label="Eliminar usuario"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!isLoadingUsers && !usersError && filteredUsers.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  No se encontraron usuarios con esos filtros.
                </div>
              )}
            </article>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5">
                <div className="mb-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
                    <Plus size={22} />
                  </div>

                  <h2 className="text-xl font-black">Crear Usuario</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Registra alumnos, entrenadores o administradores.
                  </p>
                </div>

                <form className="space-y-4">
                  <input
                    type="text"
                    value={createUserForm.fullName}
                    onChange={(event) =>
                      handleCreateUserChange("fullName", event.target.value)
                    }
                    placeholder="Nombre completo"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                  />

                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(event) =>
                      handleCreateUserChange("email", event.target.value)
                    }
                    placeholder="Correo electrónico"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                  />

                  <input
                    type="password"
                    value={createUserForm.password}
                    onChange={(event) =>
                      handleCreateUserChange("password", event.target.value)
                    }
                    placeholder="Contraseña"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                  />

                  <select
                    value={createUserForm.role}
                    onChange={(event) =>
                      handleCreateUserChange(
                        "role",
                        event.target.value as UserRole,
                      )
                    }
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value="STUDENT">Alumno</option>
                    <option value="TRAINER">Entrenador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>

                  {createUserForm.role === "STUDENT" && (
                    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                      <p className="text-sm font-bold text-yellow-500">
                        Datos de membresía
                      </p>

                      <input
                        type="text"
                        value={createUserForm.dni}
                        onChange={(event) =>
                          handleCreateUserChange("dni", event.target.value)
                        }
                        placeholder="DNI / Código de alumno"
                        maxLength={8}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                      />

                      <input
                        type="text"
                        value={createUserForm.phoneNumber}
                        onChange={(event) =>
                          handleCreateUserChange(
                            "phoneNumber",
                            event.target.value,
                          )
                        }
                        placeholder="Celular"
                        maxLength={9}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                      />

                      <select
                        value={createUserForm.membershipPlan}
                        onChange={(event) =>
                          handleCreateUserChange(
                            "membershipPlan",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                      >
                        <option value="LIBRE">Libre</option>
                        <option value="MENSUAL">1 mes</option>
                        <option value="TRIMESTRAL">3 meses</option>
                        <option value="SEMESTRAL">6 meses</option>
                        <option value="ANUAL">1 año</option>
                      </select>

                      <input
                        type="number"
                        value={createUserForm.membershipAmount}
                        onChange={(event) =>
                          handleCreateUserChange(
                            "membershipAmount",
                            event.target.value,
                          )
                        }
                        placeholder="Monto pagado"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                      />

                      <input
                        type="date"
                        value={createUserForm.membershipStartDate}
                        onChange={(event) =>
                          handleCreateUserChange(
                            "membershipStartDate",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                      />
                    </div>
                  )}

                  {createUserError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                      {createUserError}
                    </div>
                  )}

                  {createUserMessage && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                      {createUserMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={isCreatingUser}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={19} />
                    {isCreatingUser ? "Creando usuario..." : "Crear Usuario"}
                  </button>
                </form>
              </section>

              {editingUser && editUserForm && (
                <section className="rounded-2xl border border-yellow-500/30 bg-neutral-900 p-4 shadow-xl sm:p-5">
                  <div className="mb-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
                      <Edit size={22} />
                    </div>

                    <h2 className="text-xl font-black">Editar Usuario</h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Modificando: {editingUser.email}
                    </p>
                  </div>

                  <form className="space-y-4">
                    <input
                      type="text"
                      value={editUserForm.fullName}
                      onChange={(event) =>
                        handleEditUserChange("fullName", event.target.value)
                      }
                      placeholder="Nombre completo"
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                    />

                    <input
                      type="email"
                      value={editUserForm.email}
                      onChange={(event) =>
                        handleEditUserChange("email", event.target.value)
                      }
                      placeholder="Correo electrónico"
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                    />

                    <select
                      value={editUserForm.role}
                      onChange={(event) =>
                        handleEditUserChange(
                          "role",
                          event.target.value as UserRole,
                        )
                      }
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
                    >
                      <option value="STUDENT">Alumno</option>
                      <option value="TRAINER">Entrenador</option>
                      <option value="ADMIN">Administrador</option>
                    </select>

                    <select
                      value={editUserForm.active ? "true" : "false"}
                      onChange={(event) =>
                        handleEditUserChange(
                          "active",
                          event.target.value === "true",
                        )
                      }
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>

                    {editUserForm.role === "STUDENT" && (
                      <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                        <p className="text-sm font-bold text-yellow-500">
                          Datos de membresía
                        </p>

                        <input
                          type="text"
                          value={editUserForm.dni}
                          onChange={(event) =>
                            handleEditUserChange("dni", event.target.value)
                          }
                          placeholder="DNI"
                          maxLength={8}
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                        />

                        <input
                          type="text"
                          value={editUserForm.phoneNumber}
                          onChange={(event) =>
                            handleEditUserChange(
                              "phoneNumber",
                              event.target.value,
                            )
                          }
                          placeholder="Celular"
                          maxLength={9}
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                        />

                        <select
                          value={editUserForm.membershipPlan}
                          onChange={(event) =>
                            handleEditUserChange(
                              "membershipPlan",
                              event.target.value as MembershipPlan,
                            )
                          }
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                        >
                          <option value="LIBRE">Libre</option>
                          <option value="MENSUAL">1 mes</option>
                          <option value="TRIMESTRAL">3 meses</option>
                          <option value="SEMESTRAL">6 meses</option>
                          <option value="ANUAL">1 año</option>
                        </select>

                        <input
                          type="number"
                          value={editUserForm.membershipAmount}
                          onChange={(event) =>
                            handleEditUserChange(
                              "membershipAmount",
                              event.target.value,
                            )
                          }
                          placeholder="Monto pagado"
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-yellow-500"
                        />

                        <input
                          type="date"
                          value={editUserForm.membershipStartDate}
                          onChange={(event) =>
                            handleEditUserChange(
                              "membershipStartDate",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                        />
                      </div>
                    )}

                    {editError && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                        {editError}
                      </div>
                    )}

                    {editMessage && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                        {editMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={cancelEditingUser}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 font-bold text-neutral-300 transition hover:bg-neutral-800 active:scale-[0.98]"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveEditUser}
                        disabled={isSavingEdit}
                        className="rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingEdit ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </aside>
          </section>
        </section>
      </div>
    </main>
  )
}