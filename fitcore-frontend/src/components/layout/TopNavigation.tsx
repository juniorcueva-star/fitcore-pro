import { LogOut } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { getAuthUser, logoutAuthUser } from "../../features/auth/auth.utils"

const navigationItems = [
  { label: "Login", shortLabel: "Login", path: "/login" },
  { label: "Admin", shortLabel: "Admin", path: "/admin" },
  { label: "Entrenador", shortLabel: "Coach", path: "/entrenador" },
  { label: "Alumno", shortLabel: "Alumno", path: "/alumno" },
]

export function TopNavigation() {
  const navigate = useNavigate()
  const user = getAuthUser()

  const handleLogout = () => {
    logoutAuthUser()
    navigate("/login", { replace: true })
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/95 px-3 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="hidden shrink-0 sm:block">
          <h1 className="text-lg font-black text-white">
            FitCore <span className="text-yellow-500">Pro</span>
          </h1>
        </div>

        <nav className="grid flex-1 grid-cols-4 gap-2 sm:max-w-xl">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-xl px-2 py-3 text-center text-xs font-bold transition active:scale-[0.97] sm:px-4 sm:text-sm ${
                  isActive
                    ? "bg-yellow-500 text-black"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`
              }
            >
              <span className="sm:hidden">{item.shortLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="hidden items-center gap-3 lg:flex">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs font-semibold text-yellow-500">
                {user.role}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        )}

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97] lg:hidden"
            aria-label="Cerrar sesión"
          >
            <LogOut size={19} />
          </button>
        )}
      </div>
    </header>
  )
}