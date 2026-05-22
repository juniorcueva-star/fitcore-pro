import {
  BarChart3,
  CalendarDays,
  DollarSign,
  Search,
  Settings,
  Shield,
  Users,
  UserPlus,
} from "lucide-react"
import { adminMetrics, recentEnrollments } from "../../data/mockData"

const sidebarItems = [
  { label: "Inicio", icon: BarChart3, active: true },
  { label: "Alumnos", icon: Users, active: false },
  { label: "Staff", icon: Shield, active: false },
  { label: "Ajustes", icon: Settings, active: false },
]

const metricIcons = [Users, UserPlus, DollarSign]

const attendanceDays = [
  { day: "Lun", value: "h-24" },
  { day: "Mar", value: "h-32" },
  { day: "Mié", value: "h-20" },
  { day: "Jue", value: "h-36" },
  { day: "Vie", value: "h-28" },
  { day: "Sáb", value: "h-16" },
]

export function AdminDashboard() {
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

          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-500">
                Panel del Administrador
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Dashboard del Dueño
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                Control general del gimnasio, matrículas y actividad semanal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <Search size={18} className="text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600 sm:w-52"
                />
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
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminMetrics.map((metric, index) => {
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
                      Actual
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
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">
                    Matrículas Recientes
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Últimos alumnos registrados en el gimnasio.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                  <CalendarDays size={22} />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-neutral-950">
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th className="px-4 py-3 font-semibold">Nombre</th>
                      <th className="px-4 py-3 font-semibold">
                        Coach Asignado
                      </th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Vencimiento</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentEnrollments.map((enrollment) => (
                      <tr
                        key={enrollment.id}
                        className="border-b border-neutral-800/70 last:border-b-0"
                      >
                        <td className="px-4 py-4 font-semibold text-white">
                          {enrollment.name}
                        </td>
                        <td className="px-4 py-4 text-neutral-400">
                          {enrollment.coach}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-neutral-400">
                          {enrollment.expiration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-neutral-500 sm:hidden">
                Desliza la tabla hacia los lados para ver más información.
              </p>
            </article>

            <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-5">
              <div className="mb-6">
                <h2 className="text-xl font-black">
                  Asistencia Semanal
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Simulación visual del flujo de alumnos.
                </p>
              </div>

              <div className="flex h-56 items-end justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                {attendanceDays.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center justify-end gap-3"
                  >
                    <div
                      className={`w-full rounded-t-xl bg-yellow-500/80 transition hover:bg-yellow-400 ${item.value}`}
                    />
                    <span className="text-xs font-semibold text-neutral-500">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  )
}