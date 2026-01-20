
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

  const acceptPendingInvite = async (authToken) => {
    const pendingInviteToken = localStorage.getItem("pendingInviteToken");
    if (!pendingInviteToken) return null;

    try {
      const res = await api.post(
        "/api/invitations/accept",
        { token: pendingInviteToken },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      localStorage.removeItem("pendingInviteToken");
      return res.data?.flatId || null;
    } catch {
      // If it fails, don't block login
      localStorage.removeItem("pendingInviteToken");
      return null;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await api.post("/api/auth/login", { email, password });
      const authToken = response.data.authToken;

      storeToken(authToken);
      await authenticateUser();

      // ✅ If user came from an invite link, accept it automatically
      const flatId = await acceptPendingInvite(authToken);
      if (flatId) {
        navigate(`/flats/${flatId}`, { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-8 md:pt-10 md:pb-16">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="order-2 bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white md:order-1 md:p-10">
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                Manage shared living, effortlessly.
              </h2>

              <p className="mt-2 text-white/90 md:mt-3">
                Track expenses, tasks, and flat balance — all in one place.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm md:mt-6 md:space-y-3 md:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/90" />
                  <span>
                    <strong>Expenses:</strong> who paid and how it’s split.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/90" />
                  <span>
                    <strong>Tasks:</strong> assign and track progress.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/90" />
                  <span>
                    <strong>Balance:</strong> instantly see who owes whom.
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-white/90 md:mt-6">
                <p className="font-semibold text-white">How it works</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Create a flat and invite roommates.</li>
                  <li>Add expenses and tasks.</li>
                  <li>Check the balance and settle up.</li>
                </ol>
              </div>
            </div>

            <div className="order-1 p-5 md:order-2 md:p-10">
              <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
              <p className="mt-1 text-sm text-slate-600">
                Use your account to access your flats.
              </p>

              {errorMessage && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:mt-4">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4 md:mt-6">
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@roomie.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
                >
                  Sign in
                </button>

                <div className="flex justify-center gap-2 pt-1 text-sm text-slate-600 md:pt-2">
                  <span>Don’t have an account?</span>
                  <Link to="/signup" className="font-semibold text-emerald-700 hover:underline">
                    Create account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
