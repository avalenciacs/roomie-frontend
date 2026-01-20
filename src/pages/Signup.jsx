
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";

function Signup() {
  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      localStorage.removeItem("pendingInviteToken");
      return null;
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await api.post("/api/auth/signup", { name, email, password });
      const loginRes = await api.post("/api/auth/login", { email, password });

      const authToken = loginRes.data.authToken;
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
      setErrorMessage(error?.response?.data?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-8 md:pt-10 md:pb-16">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="order-2 bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white md:order-1 md:p-10">
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                Create your account.
              </h2>

              <p className="mt-2 text-white/90 md:mt-3">
                Set your name and start managing shared living with your roommates.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm md:mt-6 md:space-y-3 md:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/90" />
                  <span>
                    <strong>Invite roommates</strong> to your flat.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/90" />
                  <span>
                    <strong>Track expenses</strong> and split them fairly.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/90" />
                  <span>
                    <strong>Assign tasks</strong> and stay organized.
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-white/90 md:mt-6">
                <p className="font-semibold text-white">Password requirements</p>
                <p className="mt-1">
                  Min. 6 characters, 1 number, 1 lowercase and 1 uppercase letter.
                </p>
              </div>
            </div>

            <div className="order-1 p-5 md:order-2 md:p-10">
              <h1 className="text-2xl font-semibold text-slate-900">Sign up</h1>
              <p className="mt-1 text-sm text-slate-600">
                Create an account to start using Roomie.
              </p>

              {errorMessage && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:mt-4">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="mt-4 space-y-4 md:mt-6">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anderson"
                    required
                    autoComplete="name"
                  />
                </div>

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
                    placeholder="Roomie123"
                    required
                    autoComplete="new-password"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Must include uppercase, lowercase, and a number.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>

                <div className="flex justify-center gap-2 pt-1 text-sm text-slate-600 md:pt-2">
                  <span>Already have an account?</span>
                  <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                    Sign in
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

export default Signup;
