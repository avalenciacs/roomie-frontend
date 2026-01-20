// src/pages/InvitePage.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, CardHeader, Button, Pill } from "../components/ui/ui";

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useContext(AuthContext);

  const token = searchParams.get("token") || "";
  const [invite, setInvite] = useState(null);
  const [flatPreview, setFlatPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [pageError, setPageError] = useState("");

  const redirectUrl = useMemo(() => {
    const encodedToken = encodeURIComponent(token);
    return `/invite?token=${encodedToken}`;
  }, [token]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setPageError("");

      if (!token) {
        setLoading(false);
        setPageError("Missing invitation token.");
        return;
      }

      try {
        // Public endpoint: validate token & show preview (no auth)
        const res = await api.get(`/api/invites/${token}`);
        if (!alive) return;

        setInvite(res.data?.invite || res.data);
        setFlatPreview(res.data?.flat || res.data?.flatPreview || null);
      } catch (e) {
        if (!alive) return;
        setPageError(e?.response?.data?.message || "Invitation not available.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setPageError("");

    try {
      // Protected endpoint: requires authToken in api instance (Authorization header)
      const res = await api.post(`/api/invites/${token}/accept`);
      const flatId = res.data?.flatId || res.data?.flat?._id || res.data?._id;

      if (flatId) {
        navigate(`/flats/${flatId}`);
      } else {
        navigate("/"); // fallback
      }
    } catch (e) {
      setPageError(e?.response?.data?.message || "Error accepting invitation.");
    } finally {
      setAccepting(false);
    }
  };

  // ───────── STATES ─────────
  if (loading || authLoading) {
    return (
      <ResponsiveLayout title="Invitation" subtitle="Loading…">
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-200/60" />
        </div>
      </ResponsiveLayout>
    );
  }

  // Invalid / expired token
  if (!invite) {
    return (
      <ResponsiveLayout title="Invitation" subtitle="">
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">
              Invitation not available
            </p>
            {pageError ? (
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            ) : null}

            <div className="mt-4">
              <Link to="/">
                <Button>Go to My Flats</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  // Not logged in: show clear actions (Login / Signup) keeping redirect
  if (!user) {
    return (
      <ResponsiveLayout title="You're invited" subtitle="">
        <Card>
          <CardHeader
            title="Join this flat"
            subtitle="Login or create an account to accept the invitation"
            right={<Pill tone="neutral">Invite</Pill>}
          />
          <CardBody>
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {flatPreview?.name || invite?.flatName || "Flat"}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {flatPreview?.description ||
                    invite?.flatDescription ||
                    "Shared flat workspace"}
                </p>
                {invite?.invitedEmail ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Invited email: {invite.invitedEmail}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Link to={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
                  <Button className="w-full">Login</Button>
                </Link>

                <Link
                  to={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                >
                  <Button
                    variant="outline"
                    className="w-full border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  >
                    Create account
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-slate-500">
                After you login or sign up, you will return here automatically.
              </p>
            </div>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  // Logged in: accept
  return (
    <ResponsiveLayout title="You're invited" subtitle="">
      <Card>
        <CardHeader
          title="Accept invitation"
          subtitle="You’ll become a member of this flat"
          right={<Pill tone="neutral">Invite</Pill>}
        />
        <CardBody>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {flatPreview?.name || invite?.flatName || "Flat"}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                {flatPreview?.description ||
                  invite?.flatDescription ||
                  "Shared flat workspace"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Signed in as: {user.email}
              </p>
            </div>

            {pageError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-900">Heads up</p>
                <p className="mt-1 text-sm text-rose-800">{pageError}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                >
                  Not now
                </Button>
              </Link>

              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full sm:w-auto"
              >
                {accepting ? "Accepting…" : "Accept invitation"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </ResponsiveLayout>
  );
}
