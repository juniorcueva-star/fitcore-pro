import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dumbbell, Lock, Mail } from "lucide-react"
import type { AuthUser, LoginFormData } from "./auth.types"
import { getAuthUser, getDefaultPathByRole, saveAuthUser } from "./auth.utils"

const demoUsers: AuthUser[] = [
  {
    id: 1,
    name: "Administrador FitCore",
    email: "admin@fitcore.com",
    role: "ADMIN",
  },
  {
    id: 2,
    name: "Coach Lucía",
    email: "coach@fitcore.com",
    role: "TRAINER",
  },
  {
    id: 3,
    name: "Carlos Mendoza",
    email: "alumno@fitcore.com",
    role: "STUDENT",
  },
]

export function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })

  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const currentUser = getAuthUser()

    if (currentUser) {
      navigate(getDefaultPathByRole(currentUser.role), { replace: true })
    }
  }, [navigate])

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }))

    setErrorMessage("")
  }

  const handleLogin = () => {
    const email = formData.email.trim().toLowerCase()
    const password = formData.password.trim()

    if (!email || !password) {
      setErrorMessage("Ingresa tu correo electrónico y contraseña.")
      return
    }

    const user = demoUsers.find((demoUser) => demoUser.email === email)

    if (!user) {
      setErrorMessage("Usuario no encontrado. Usa una cuenta de demostración.")
      return
    }

    saveAuthUser(user)
    navigate(getDefaultPathByRole(user.role))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 pt-24 pb-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/20">
          <Dumbbell size={32} strokeWidth={2.5} />
        </div>

        <h1 className="mt-6 text-center text-4xl font-black tracking-tight">
          FitCore <span className="text-yellow-500">Pro</span>
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-neutral-400">
          Accede a tu plataforma fitness profesional para gestionar rutinas,
          alumnos y entrenamientos.
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">
              Correo Electrónico
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 transition focus-within:border-yellow-500">
              <Mail size={20} className="text-neutral-500" />

              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="admin@fitcore.com"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">
              Contraseña
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 transition focus-within:border-yellow-500">
              <Lock size={20} className="text-neutral-500" />

              <input
                type="password"
                value={formData.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                placeholder="Ingresa tu contraseña"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98]"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-yellow-500">
            Cuentas de demostración
          </p>

          <div className="mt-3 space-y-2 text-sm text-neutral-400">
            <p>
              Admin:{" "}
              <span className="font-semibold text-white">
                admin@fitcore.com
              </span>
            </p>
            <p>
              Entrenador:{" "}
              <span className="font-semibold text-white">
                coach@fitcore.com
              </span>
            </p>
            <p>
              Alumno:{" "}
              <span className="font-semibold text-white">
                alumno@fitcore.com
              </span>
            </p>
          </div>

          <p className="mt-3 text-xs text-neutral-500">
            Puedes usar cualquier contraseña por ahora. Luego conectaremos esto
            con Spring Boot, JWT y PostgreSQL.
          </p>
        </div>
      </section>
    </main>
  )
}