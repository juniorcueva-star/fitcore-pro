import { ClipboardList, Dumbbell, Plus, Target, Users } from "lucide-react"
import { trainerStudents } from "../../data/mockData"

export function TrainerDashboard() {
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
                Administra tus alumnos asignados, revisa sus objetivos y crea
                rutinas personalizadas según su progreso físico.
              </p>
            </div>

            <div className="flex w-full items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 md:w-auto md:px-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
                <Users size={24} />
              </div>

              <div>
                <p className="text-sm text-neutral-400">Mis Alumnos</p>
                <p className="text-2xl font-black">15 asignados</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Alumnos Asignados</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Lista de alumnos bajo tu seguimiento.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-yellow-500">
                <Dumbbell size={24} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {trainerStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition hover:-translate-y-1 hover:border-yellow-500/60"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={student.image}
                      alt={student.name}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />

                    <div>
                      <h3 className="font-bold text-white">{student.name}</h3>
                      <p className="mt-1 text-sm text-neutral-400">
                        {student.goal}
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
          </article>

          <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-black">
                <ClipboardList size={24} />
              </div>

              <h2 className="text-xl font-black">Asignar Rutina</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Registra un ejercicio base para asignarlo a un alumno.
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-300">
                  Nombre del Ejercicio
                </label>

                <input
                  type="text"
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
                    placeholder="4"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-300">
                    Repeticiones
                  </label>

                  <input
                    type="number"
                    placeholder="12"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-500"
                  />
                </div>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-[0.98]"
              >
                <Plus size={20} />
                Asignar Rutina
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-yellow-500">
                Próxima mejora
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                Luego este formulario guardará rutinas reales en PostgreSQL
                mediante el backend de Spring Boot.
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}