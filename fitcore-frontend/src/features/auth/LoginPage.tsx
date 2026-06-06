import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import type { LoginFormData } from "./auth.types";
import { loginRequest } from "./auth.service";
import {
  getAuthUser,
  getDefaultPathByRole,
  saveAuthSession,
} from "./auth.utils";

const GYM_LOGO_PATH = "/fitness-world-7-logo.png";

export function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = getAuthUser();

    if (currentUser) {
      navigate(getDefaultPathByRole(currentUser.role), { replace: true });
    }
  }, [navigate]);

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    setErrorMessage("");
  };

  const handleLogin = async () => {
    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    if (!email || !password) {
      setErrorMessage("Ingresa tu correo electrónico y contraseña.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await loginRequest({
        email,
        password,
      });

      const user = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      saveAuthSession(user, data.token);
      navigate(getDefaultPathByRole(user.role));
    } catch {
      setErrorMessage("Correo o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.18),transparent_35%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.06),transparent_30%)]" />

      <img
        src={GYM_LOGO_PATH}
        alt="fitness world 7"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full object-contain opacity-[0.045] blur-[1px]"
      />

      <section className="relative z-10 grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-500">
              <Sparkles size={18} />
              Sistema oficial de fitness world 7
            </div>

            <div className="mb-8 flex items-center gap-5">
              <img
                src={GYM_LOGO_PATH}
                alt="fitness world 7"
                className="h-24 w-24 rounded-3xl border border-neutral-800 bg-black object-cover shadow-2xl shadow-yellow-500/10"
              />

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
                  FITNESS
                </p>
                <h1 className="mt-1 text-5xl font-black leading-none">
                  WORLD <span className="text-yellow-500">7</span>
                </h1>
              </div>
            </div>

            <p className="text-lg leading-8 text-neutral-300">
              Plataforma privada para controlar alumnos, entrenadores,
              membresías, asistencia, rutinas y alimentación desde un solo
              lugar.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 backdrop-blur">
                <p className="text-2xl font-black text-yellow-500">MEJOR</p>
                <p className="mt-2 text-sm font-semibold text-neutral-300">
                  Control de membresías
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 backdrop-blur">
                <p className="text-2xl font-black text-yellow-500">OFRECEMOS</p>
                <p className="mt-2 text-sm font-semibold text-neutral-300">
                  Rutinas y nutrición
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 backdrop-blur">
                <p className="text-2xl font-black text-yellow-500">MANEJAMOS</p>
                <p className="mt-2 text-sm font-semibold text-neutral-300">
                  Asistencia por DNI
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="w-full rounded-[2rem] border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur sm:p-8">
          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-neutral-800 bg-black shadow-lg shadow-yellow-500/10">
            <img
              src={GYM_LOGO_PATH}
              alt="fitness world 7"
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="mt-6 text-center text-4xl font-black tracking-tight">
            FITNESS<span className="text-yellow-500">WORLD 7</span>
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-neutral-400">
            Accede a tu cuenta privada para gestionar tu entrenamiento,
            asistencia y progreso.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs font-bold text-yellow-500">
            <ShieldCheck size={17} />
            Acceso seguro 
          </div>

          <form className="mt-8 space-y-5" autoComplete="off">
            <input
              type="text"
              className="hidden"
              tabIndex={-1}
              autoComplete="username"
              aria-hidden="true"
            />
            <input
              type="password"
              className="hidden"
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">
                Correo de acceso
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 transition focus-within:border-yellow-500">
                <Mail size={20} className="text-neutral-500" />

                <input
                  type="email"
                  name="fitworld_login_email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="usuario@fitness.com"
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
                  name="fitworld_login_password"
                  autoComplete="new-password"
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
              disabled={isLoading}
              className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
