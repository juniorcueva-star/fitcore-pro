import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  CalendarDays,
  DollarSign,
  Edit,
  Filter,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react"
import { adminMetrics } from "../../data/mockData"
import {
  getAdminDashboardAccess,
  type DashboardAccessResponse,
} from "../../services/dashboard.service"
import {
  createAdminUserRequest,
  deleteAdminUserRequest,
  getAdminUsersRequest,
  toggleAdminUserActiveRequest,
  updateAdminUserRequest,
  type AdminUserResponse,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "./admin.service"
import type { UserRole } from "../auth/auth.types"

type RoleFilter = "ALL" | UserRole
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

const sidebarItems = [
  { label: "Inicio", icon: BarChart3, active: true },
  { label: "Alumnos", icon: Users, active: false },
  { label: "Staff", icon: Shield, active: false },
  { label: "Ajustes", icon: Settings, active: false },
]

const metricIcons = [Users, UserPlus, DollarSign]

const initialCreateUserForm: CreateUserFormData = {
  fullName: "",
  email: "",
  password: "",
  role: "STUDENT",
}

function formatRole(role: string) {
  if (role === "ADMIN") return "Administrador"
  if (role === "TRAINER") return "Entrenador"
  return "Alumno"
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export function AdminDashboard() {
  const [backendStatus, setBackendStatus] =
    useState<DashboardAccessResponse | null>(null)

  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const [createUserForm, setCreateUserForm] =
    useState<CreateUserFormData>(initialCreateUserForm)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [createUserMessage, setCreateUserMessage] = useState("")
  const [createUserError, setCreateUserError] = useState("")

  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null)
  const [editUserForm, setEditUserForm] = useState<UpdateUserFormData | null>(
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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)

      const matchesRole =
        roleFilter === "ALL" ? true : user.role === roleFilter

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? user.active
            : !user.active

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  const realMetrics = useMemo(() => {
    const studentsCount = users.filter((user) => user.role === "STUDENT").length
    const trainersCount = users.filter((user) => user.role === "TRAINER").length
    const activeCount = users.filter((user) => user.active).length

    return [
      {
        title: "Usuarios Activos",
        value: String(activeCount),
        description: "Usuarios activos en PostgreSQL",
      },
      {
        title: "Alumnos Registrados",
        value: String(studentsCount),
        description: "Alumnos reales del sistema",
      },
      {
        title: "Entrenadores",
        value: String(trainersCount),
        description: "Staff registrado",
      },
    ]
  }, [users])

  const metricsToShow = users.length > 0 ? realMetrics : adminMetrics

  const handleCreateUserChange = (
    field: keyof CreateUserFormData,
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
    const fullName = createUserForm.fullName.trim()
    const email = createUserForm.email.trim().toLowerCase()
    const password = createUserForm.password.trim()

    if (!fullName || !email || !password) {
      setCreateUserError("Completa nombre, correo y contraseña.")
      return
    }

    if (password.length < 6) {
      setCreateUserError("La contraseña debe tener mínimo 6 caracteres.")
      return
    }

    try {
      setIsCreatingUser(true)
      setCreateUserError("")
      setCreateUserMessage("")

      const newUser = await createAdminUserRequest({
        fullName,
        email,
        password,
        role: createUserForm.role,
      })

      setUsers((currentUsers) => [...currentUsers, newUser])
      setCreateUserForm(initialCreateUserForm)
      setCreateUserMessage("Usuario creado correctamente.")
    } catch {
      setCreateUserError("No se pudo crear el usuario. Verifica el correo.")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const startEditingUser = (user: AdminUserResponse) => {
    setEditingUser(user)
    setEditUserForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
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
    field: keyof UpdateUserFormData,
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

    const fullName = editUserForm.fullName.trim()
    const email = editUserForm.email.trim().toLowerCase()

    if (!fullName || !email) {
      setEditError("Completa nombre y correo.")
      return
    }

    try {
      setIsSavingEdit(true)
      setEditError("")
      setEditMessage("")

      const updatedUser = await updateAdminUserRequest(editingUser.id, {
        fullName,
        email,
        role: editUserForm.role,
        active: editUserForm.active,
      })

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      )

      setEditMessage("Usuario actualizado correctamente.")
      setEditingUser(updatedUser)
      setEditUserForm({
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        active: updatedUser.active,
      })
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
        setEditUserForm({
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
          active: updatedUser.active,
        })
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
          <div className="mb-4 grid grid-cols-4 gap-2 lg:hidden">
            {sidebarItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-xs font-bold transition active:scale-[0.97] ${
                    item.active
                      ? "bg-yellow-500 text-black"
                      : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </div>

          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-500">
                Panel del Administrador
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Dashboard del Dueño
              </h1>

              <p className="mt-2 text-sm text-neutral-400">
                Control general del gimnasio, usuarios reales y actividad
                semanal.
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

            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                A
              </div>
              <div>
                <p className="text-sm font-bold">Admin</p>
                <p className="text-xs text-neutral-500">Dueño</p>
              </div>
            </div>
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <article className="min-w-0 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black">Usuarios Reales</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Usuarios cargados desde PostgreSQL mediante Spring Boot.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                  <CalendarDays size={22} />
                </div>
              </div>

              <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_160px_160px]">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <Search size={18} className="text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar por nombre o correo..."
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
              </div>

              <div className="mb-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs font-semibold text-neutral-400">
                Mostrando{" "}
                <span className="text-yellow-500">
                  {filteredUsers.length}
                </span>{" "}
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

              {!isLoadingUsers && !usersError && filteredUsers.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
                  No se encontraron usuarios con esos filtros.
                </div>
              )}

              {!isLoadingUsers && !usersError && filteredUsers.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table
                    className="w-full text-left text-sm"
                    style={{ minWidth: "900px" }}
                  >
                    <thead className="bg-neutral-950">
                      <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Nombre</th>
                        <th className="px-4 py-3 font-semibold">Correo</th>
                        <th className="px-4 py-3 font-semibold">Rol</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold">Creado</th>
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
                            {user.email}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleUserActive(user.id)}
                              className={`rounded-full px-3 py-1 text-xs font-bold transition active:scale-95 ${
                                user.active
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              }`}
                            >
                              {user.active ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-neutral-400">
                            {formatDate(user.createdAt)}
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

              <p className="mt-3 text-xs text-neutral-500 sm:hidden">
                Desliza la tabla hacia los lados para ver más información.
              </p>
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