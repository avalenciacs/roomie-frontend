import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ResponsiveLayout from "../components/ResponsiveLayout";
import FlatTopNav from "../components/FlatTopNav";
import { Card, CardBody, CardHeader, Button, Input, Pill } from "../components/ui/ui";

export default function FlatEdit() {
  const { flatId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const token = localStorage.getItem("authToken");

  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // (opcional) para editar nombre/desc luego
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // Delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isOwner = useMemo(() => {
    if (!flat || !user?._id) return false;
    return String(flat.owner) === String(user._id);
  }, [flat, user]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setPageError("");
      try {
        const res = await api.get(`/api/flats/${flatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!alive) return;
        setFlat(res.data);
        setName(res.data?.name || "");
        setDesc(res.data?.description || "");
      } catch (e) {
        if (!alive) return;
        setPageError(e?.response?.data?.message || "Error loading flat");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [flatId, token]);

  const requiredText = useMemo(() => (flat?.name?.trim() ? flat.name.trim() : "DELETE"), [flat]);
  const canDelete = isOwner && confirmText.trim() === requiredText;

  const deleteFlat = async () => {
    if (!canDelete) return;

    try {
      await api.delete(`/api/flats/${flatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Te mando al home (My Flats)
      navigate("/", { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || "Error deleting flat");
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout top={<FlatTopNav flatId={flatId} title="Settings" subtitle="Loading…" />} hideHeader>
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200/60" />
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout top={<FlatTopNav flatId={flatId} title="Settings" subtitle="" />} hideHeader>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Flat not found</p>
            {pageError ? <p className="mt-1 text-sm text-slate-600">{pageError}</p> : null}
            <div className="mt-4">
              <Link to="/">
                <Button>Back to My Flats</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      top={<FlatTopNav flatId={flatId} title={flat.name} subtitle={flat.description || "Shared flat workspace"} />}
      hideHeader
    >
      {pageError ? (
        <Card className="mt-4">
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Heads up</p>
            <p className="mt-1 text-sm text-slate-600">{pageError}</p>
          </CardBody>
        </Card>
      ) : null}

      <div className="mt-4 space-y-4">
        {/* BASIC SETTINGS (listo para que luego implementes PUT) */}
        <Card>
          <CardHeader title="Settings" subtitle="Edit your flat details" right={!isOwner ? <Pill tone="neutral">Read only</Pill> : null} />
          <CardBody>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-700">Name</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700">Description</p>
                <Input value={desc} onChange={(e) => setDesc(e.target.value)} disabled={!isOwner} />
              </div>

              {/* Guardar aún no (si quieres te lo hago con PUT) */}
              <p className="text-xs text-slate-500">
                Saving not implemented yet. This screen is also the best place for delete.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* DANGER ZONE */}
        <Card className="border-rose-200">
          <CardHeader title="Danger zone" subtitle="Irreversible actions" />
          <CardBody>
            {!isOwner ? (
              <p className="text-sm text-slate-600">Only the owner can delete this flat.</p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Delete flat</p>
                  <p className="mt-1 text-sm text-slate-600">
                    This deletes the flat. You will lose access to its data.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    setConfirmOpen(true);
                    setConfirmText("");
                  }}
                >
                  Delete…
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* CONFIRM MODAL */}
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setConfirmOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-slate-900">Confirm delete</p>
            <p className="mt-1 text-sm text-slate-600">
              Type <span className="font-semibold text-slate-900">{requiredText}</span> to confirm.
            </p>

            <div className="mt-3">
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={requiredText} />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!canDelete}
                className={!canDelete ? "opacity-50" : ""}
                onClick={deleteFlat}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ResponsiveLayout>
  );
}
