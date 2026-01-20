// src/pages/InviteGate.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, Button } from "../components/ui/ui";

export default function InviteGate() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        if (!token) {
          setError("Invalid invitation link.");
          setBusy(false);
          return;
        }

        // If NOT logged in: store token and go to login
        if (!isLoggedIn) {
          localStorage.setItem("pendingInviteToken", token);
          navigate("/login", { replace: true });
          return;
        }

        // If logged in: accept now
        const authToken = localStorage.getItem("authToken");
        const res = await api.post(
          "/api/invitations/accept",
          { token },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        localStorage.removeItem("pendingInviteToken");

        if (!alive) return;
        navigate(`/flats/${res.data.flatId}`, { replace: true });
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || "Could not accept invitation.");
      } finally {
        if (alive) setBusy(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [token, isLoggedIn, navigate]);

  return (
    <ResponsiveLayout hideHeader>
      <Card className="max-w-xl mx-auto">
        <CardBody>
          {busy ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Joining flat…</p>
              <p className="text-sm text-slate-600">Please wait.</p>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Invite error</p>
              <p className="text-sm text-slate-600">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/login")}>Go to login</Button>
                <Button variant="outline" onClick={() => navigate("/flats")}>
                  My flats
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700">Done.</p>
          )}
        </CardBody>
      </Card>
    </ResponsiveLayout>
  );
}
