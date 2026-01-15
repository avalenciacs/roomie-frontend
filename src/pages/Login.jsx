import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";



function Login() {
  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await api.post("/auth/login", { email, password });
      storeToken(response.data.authToken);
      await authenticateUser();
      navigate("/");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed");
    }
  };

  const fillDemo = () => {
    setEmail("test1@roomie.com");
    setPassword("Prueba123");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid overflow-hidden rounded-2xl border bg-white shadow-sm md:grid-cols-2">
          {/* Brand / Info */}
          <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-500 p-8 text-white">
            <div className="flex items-center gap-3">
            
            </div>

            <h1 className="mt-8 text-3xl font-bold leading-tight">
              Organiza tu piso sin líos.
            </h1>
            <p className="mt-3 text-white/90">
              Gastos, tareas y balance del piso en un solo sitio.
            </p>

            <ul className="mt-8 space-y-3 text-white/95">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-white/90" />
                <span>
                  <strong>Expenses:</strong> registra quién pagó y entre quién se
                  reparte.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-white/90" />
                <span>
                  <strong>Tasks:</strong> asigna tareas y marca progreso (pending
                  → doing → done).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-white/90" />
                <span>
                  <strong>Balance:</strong> calcula quién debe a quién de forma
                  clara.
                </span>
              </li>
            </ul>

            <div className="mt-10 rounded-xl bg-white/10 p-4 text-sm text-white/90">
              <p className="font-medium text-white">Tip</p>
              <p className="mt-1">
                Pulsa <strong>Use demo</strong> para autocompletar credenciales
                de prueba.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
            <p className="mt-1 text-sm text-slate-600">
              Entra con tu cuenta para ver tus pisos.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test1@roomie.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={fillDemo}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Use demo
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Sign in
                </button>
              </div>

              <p className="pt-2 text-xs text-slate-500">
                No hay signup en este MVP. Acceso por usuarios creados en el seed
                / admin.
                <span className="ml-1">
                  <Link to="/" className="underline">
                    (volver)
                  </Link>
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
