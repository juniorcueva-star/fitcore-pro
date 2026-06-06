import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { getMyProfileRequest } from "../../features/auth/auth.service"
import type {
  UserProfileResponse,
  UserRole,
} from "../../features/auth/auth.types"
import { getAuthUser, logoutAuthUser } from "../../features/auth/auth.utils"

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:8080"

function getRoleLabel(role?: UserRole) {
  if (role === "ADMIN") return "Administrador"
  if (role === "TRAINER") return "Entrenador"
  if (role === "STUDENT") return "Alumno"
  return ""
}

function getInitials(fullName?: string) {
  if (!fullName) return "FW"

  const names = fullName.trim().split(" ").filter(Boolean)

  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }

  return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
}

function getProfilePhotoUrl(profilePhotoUrl?: string | null) {
  if (!profilePhotoUrl) return null

  if (profilePhotoUrl.startsWith("http")) {
    return profilePhotoUrl
  }

  return `${API_BASE_URL}${profilePhotoUrl}`
}

export function TopNavigation() {
  const navigate = useNavigate()
  const user = getAuthUser()
  const userEmail = user?.email

  const [profile, setProfile] = useState<UserProfileResponse | null>(null)

  useEffect(() => {
    if (!userEmail) {
      return
    }

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
  }, [userEmail])

  const handleLogout = () => {
    logoutAuthUser()
    setProfile(null)
    navigate("/login", { replace: true })
  }

  const displayName = profile?.fullName ?? user?.fullName
  const displayRole = getRoleLabel(profile?.role ?? user?.role)
  const profilePhotoUrl = getProfilePhotoUrl(profile?.profilePhotoUrl)

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate("/login")
              return
            }

            if (user.role === "ADMIN") {
              navigate("/admin")
              return
            }

            if (user.role === "TRAINER") {
              navigate("/entrenador")
              return
            }

            navigate("/alumno")
          }}
          className="flex shrink-0 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-sm font-black text-black">
            FW7
          </div>

          <div>
            <h1 className="text-base font-black text-white sm:text-lg">
              FITNESS <span className="text-yellow-500">WORLD 7</span>
            </h1>
            <p className="hidden text-xs font-semibold text-neutral-500 sm:block">
              El lugar donde lo imposible no existe 
            </p>
          </div>
        </button>

        {!user && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `rounded-xl px-5 py-3 text-sm font-bold transition active:scale-[0.97] ${
                isActive
                  ? "bg-yellow-500 text-black"
                  : "border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-yellow-500 hover:text-yellow-500"
              }`
            }
          >
            Bienvenido
          </NavLink>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 sm:flex">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={displayName}
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-sm font-black text-black">
                  {getInitials(displayName)}
                </div>
              )}

              <div>
                <p className="max-w-48 truncate text-sm font-bold text-white">
                  {displayName}
                </p>
                <p className="text-xs font-semibold text-yellow-500">
                  {displayRole}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}