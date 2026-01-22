// frontend/src/pages/FlatDetails.jsx
import {
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import { ToastContext } from "../context/toast.context";
import ExpenseForm from "../components/ExpenseForm";
import TaskForm from "../components/TaskForm";
import ResponsiveLayout from "../components/ResponsiveLayout";
import FlatTopNav from "../components/FlatTopNav";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Pill,
} from "../components/ui/ui";

function FlatDetails() {
  const { flatId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { success, error: toastError } = useContext(ToastContext);

  const [flat, setFlat] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [email, setEmail] = useState("");

  // loading split: critical vs secondary
  const [flatLoading, setFlatLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [openTaskId, setOpenTaskId] = useState(null);
  const [openExpenseId, setOpenExpenseId] = useState(null);

  const [overlay, setOverlay] = useState("");
  const scrollYRef = useRef(0);

  // Owner settings overlay (edit/delete)
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Delete confirm modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Invite feedback
  const [inviteMsg, setInviteMsg] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Pending invites (UI only)
  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesError, setInvitesError] = useState("");
  const [invitesLoading, setInvitesLoading] = useState(false);

  // Simple in-memory cache so coming back to this page is instant
  const cacheRef = useRef(new Map());

  const token = localStorage.getItem("authToken");

  // ───────── HELPERS ─────────
  const nameOrEmail = (u) => u?.name || u?.email || "User";

  const UserName = ({ u, fallback = "-" }) => {
    if (!u) return <span className="text-slate-600">{fallback}</span>;
    return (
      <span className="font-medium text-slate-900" title={u.email || ""}>
        {nameOrEmail(u)}
      </span>
    );
  };

  const statusLabel = (s) => {
    if (s === "pending") return "Pending";
    if (s === "doing") return "In progress";
    if (s === "done") return "Done";
    return s || "-";
  };

  const statusTone = (s) => {
    if (s === "done") return "pos";
    if (s === "doing") return "neutral";
    if (s === "pending") return "neg";
    return "neutral";
  };

  const formatMoney = (n) => `${Number(n || 0).toFixed(2)} €`;

  const fmtDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };

  const fmtDateTime = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  const ownerId = flat?.owner?._id || flat?.owner;
  const isOwner = flat && String(ownerId) === String(user?._id);

  // ───────── FETCH ─────────
  const getFlat = useCallback(async () => {
    const res = await api.get(`/api/flats/${flatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFlat(res.data);
    return res.data;
  }, [flatId, token]);

  const getExpenses = useCallback(async () => {
    const res = await api.get(`/api/flats/${flatId}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);
    return res.data;
  }, [flatId, token]);

  const getTasks = useCallback(async () => {
    const res = await api.get(`/api/flats/${flatId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
    return res.data;
  }, [flatId, token]);

  // Load pending invitations for this flat (owner only)
  const getPendingInvites = useCallback(async () => {
    if (!isOwner) return;
    setInvitesLoading(true);
    setInvitesError("");
    try {
      const res = await api.get(`/api/invitations?flatId=${flatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingInvites(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setInvitesError(
        e?.response?.data?.message || "Error loading pending invitations"
      );
      setPendingInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [flatId, token, isOwner]);

  // ───────── FAST LOAD STRATEGY ─────────
  // 1) Paint ASAP from cache
  // 2) Fetch flat (critical)
  // 3) Fetch expenses/tasks (secondary) without blocking UI
  useEffect(() => {
    let alive = true;

    // step 1: immediate from cache
    const cached = cacheRef.current.get(flatId);
    if (cached) {
      setFlat(cached.flat ?? null);
      setExpenses(cached.expenses ?? []);
      setTasks(cached.tasks ?? []);
      setFlatLoading(!cached.flat);
      setCountsLoading(!(cached.flat && cached.expenses && cached.tasks));
    } else {
      setFlat(null);
      setExpenses([]);
      setTasks([]);
      setFlatLoading(true);
      setCountsLoading(true);
    }

    const load = async () => {
      setPageError("");

      // step 2: critical (flat)
      try {
        setFlatLoading(true);
        const flatData = await getFlat();
        if (!alive) return;
        cacheRef.current.set(flatId, {
          ...(cacheRef.current.get(flatId) || {}),
          flat: flatData,
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Something went wrong while loading this flat.";
        if (alive) setPageError(msg);
        toastError(msg);
        // if flat fails, stop here
        if (alive) setFlatLoading(false);
        return;
      } finally {
        if (alive) setFlatLoading(false);
      }

      // step 3: secondary (counts) in background
      try {
        setCountsLoading(true);
        const [exp, tsk] = await Promise.all([getExpenses(), getTasks()]);
        if (!alive) return;
        cacheRef.current.set(flatId, {
          ...(cacheRef.current.get(flatId) || {}),
          expenses: exp,
          tasks: tsk,
        });
      } catch (err) {
        // do not block UI, just show toast / error label
        const msg =
          err?.response?.data?.message ||
          "Some sections could not be loaded yet.";
        if (alive) setPageError((prev) => prev || msg);
      } finally {
        if (alive) setCountsLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [flatId, getFlat, getExpenses, getTasks, toastError]);

  // ───────── OVERLAY ─────────
  const openOverlay = (id) => {
    scrollYRef.current = window.scrollY || 0;
    document.body.style.overflow = "hidden";
    setOverlay(id);

    setOpenExpenseId(null);
    setOpenTaskId(null);

    if (id === "members" && isOwner) getPendingInvites();
  };

  const closeOverlay = () => {
    document.body.style.overflow = "";
    setOverlay("");
    requestAnimationFrame(() => window.scrollTo(0, scrollYRef.current || 0));
  };

  // Settings sheet helpers
  const openSettings = () => {
    scrollYRef.current = window.scrollY || 0;
    document.body.style.overflow = "hidden";
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    document.body.style.overflow = "";
    setSettingsOpen(false);
    requestAnimationFrame(() => window.scrollTo(0, scrollYRef.current || 0));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (deleteOpen) setDeleteOpen(false);
      else if (settingsOpen) closeSettings();
      else if (overlay) closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay, settingsOpen, deleteOpen]);

  // ───────── MEMBERS ─────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isOwner) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setInviteMsg("");
    setIsInviting(true);

    try {
      await api.post(
        "/api/invitations",
        { flatId, email: cleanEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmail("");
      setInviteMsg(`Invitation sent to ${cleanEmail}`);
      success(`Invitation sent to ${cleanEmail}`);
      await getPendingInvites();
    } catch (err) {
      setInviteMsg("");
      const msg = err?.response?.data?.message || "Error sending invitation";
      toastError(msg);
    } finally {
      setIsInviting(false);
    }
  };

  const revokeInvite = async (invitationId) => {
    if (!isOwner) return;
    const ok = window.confirm("Revoke this invitation?");
    if (!ok) return;

    try {
      await api.post(
        `/api/invitations/${invitationId}/revoke`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success("Invitation revoked");
      await getPendingInvites();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error revoking invitation";
      toastError(msg);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const ok = window.confirm("Remove this member from the flat?");
    if (!ok) return;

    try {
      await api.delete(`/api/flats/${flatId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      success("Member removed");
      await getFlat();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error removing member";
      toastError(msg);
    }
  };

  // ───────── EXPENSES ─────────
  const createExpense = async (expenseData) => {
    try {
      await api.post(`/api/flats/${flatId}/expenses`, expenseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      success("Expense created");
      await getExpenses();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error creating expense";
      toastError(msg);
    }
  };

  const deleteExpense = async (expenseId) => {
    const ok = window.confirm("Delete this expense? This cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenExpenseId((prev) => (prev === expenseId ? null : prev));
      success("Expense deleted");
      await getExpenses();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error deleting expense";
      toastError(msg);
    }
  };

  // ───────── TASKS ─────────
  const createTask = async (taskData) => {
    try {
      await api.post(
        `/api/flats/${flatId}/tasks`,
        { ...taskData, status: "pending" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success("Task created");
      await getTasks();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error creating task";
      toastError(msg);
    }
  };

  const assignTaskToMe = async (taskId) => {
    try {
      await api.put(
        `/api/tasks/${taskId}`,
        { assignedTo: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success("Task assigned to you");
      await getTasks();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error assigning task";
      toastError(msg);
    }
  };

  const startTask = async (taskId) => {
    try {
      await api.put(
        `/api/tasks/${taskId}`,
        { status: "doing" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success("Task started");
      await getTasks();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error starting task";
      toastError(msg);
    }
  };

  const markTaskDone = async (taskId) => {
    try {
      await api.put(
        `/api/tasks/${taskId}`,
        { status: "done" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success("Task completed");
      await getTasks();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error marking task done";
      toastError(msg);
    }
  };

  const deleteTask = async (taskId) => {
    const ok = window.confirm("Delete this task? This cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenTaskId((prev) => (prev === taskId ? null : prev));
      success("Task deleted");
      await getTasks();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error deleting task";
      toastError(msg);
    }
  };

  const sortedTasks = useMemo(() => {
    const rank = { pending: 0, doing: 1, done: 2 };
    return [...tasks].sort((a, b) => {
      const ra = rank[a.status] ?? 99;
      const rb = rank[b.status] ?? 99;
      if (ra !== rb) return ra - rb;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [tasks]);

  const toggleTaskDetails = (id) =>
    setOpenTaskId((prev) => (prev === id ? null : id));
  const toggleExpenseDetails = (id) =>
    setOpenExpenseId((prev) => (prev === id ? null : id));

  // ───────── OWNER: EDIT / DELETE ─────────
  const goToEdit = () => {
    closeSettings();
    navigate(`/flats/${flatId}/edit`);
  };

  const openDelete = () => {
    setDeleteText("");
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteText("");
  };

  const handleDeleteFlat = async () => {
    if (!isOwner) return;
    const mustType = (flat?.name || "").trim();
    if (mustType && deleteText.trim() !== mustType) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/flats/${flatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      success("Flat deleted");
      closeDelete();
      closeSettings();
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Error deleting flat";
      toastError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const SkeletonPill = () => (
    <span className="inline-flex items-center">
      <span className="h-6 w-10 rounded-full bg-slate-200/70 animate-pulse" />
    </span>
  );

  const SectionCard = ({ title, subtitle, count, loading, onClick }) => (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card className="transition hover:shadow-sm">
        <CardBody>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {loading ? <SkeletonPill /> : <Pill tone="neutral">{count}</Pill>}
              <span className="text-sm font-medium text-slate-700">Show</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </button>
  );

  // ───────── STATES ─────────
  // If flat is still loading and no cached flat, show skeleton page
  if (flatLoading && !flat) {
    return (
      <ResponsiveLayout
        top={<FlatTopNav flatId={flatId} title="Loading…" subtitle="" />}
        hideHeader
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout top={<FlatTopNav flatId={flatId} title="Flat" subtitle="" />} hideHeader>
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

  const flatNameForDelete = (flat?.name || "").trim();

  return (
    <ResponsiveLayout
      top={
        <FlatTopNav
          flatId={flatId}
          title={flat.name}
          subtitle={flat.description || "Shared flat workspace"}
        />
      }
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

      {/* Launcher cards (render immediately; counts load in background) */}
      <div className="mt-4 space-y-3">
        <SectionCard
          title="Members"
          subtitle={isOwner ? "Manage members" : "Flat members"}
          count={flat.members?.length || 0}
          loading={false}
          onClick={() => openOverlay("members")}
        />

        <SectionCard
          title="Expenses"
          subtitle="Create and review shared expenses"
          count={expenses.length}
          loading={countsLoading}
          onClick={() => openOverlay("expenses")}
        />

        <SectionCard
          title="Tasks"
          subtitle="Assign tasks and track progress"
          count={tasks.length}
          loading={countsLoading}
          onClick={() => openOverlay("tasks")}
        />
      </div>

      {/* OWNER SETTINGS */}
      {isOwner ? (
        <Card className="mt-6 border-slate-200">
          <CardHeader title="Settings" subtitle="Only visible to the owner" />
          <CardBody className="space-y-3">
            <Button variant="outline" className="w-full" onClick={openSettings}>
              Open settings
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {/* SETTINGS SHEET */}
      {settingsOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={closeSettings}
            className="absolute inset-0 bg-black/30"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[85vh]">
            <div className="mx-auto w-full max-w-3xl px-4 pb-4">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Settings
                    </p>
                    <p className="text-xs text-slate-500">
                      Owner actions for this flat
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="px-3 py-2"
                    onClick={closeSettings}
                  >
                    Close
                  </Button>
                </div>

                <div className="px-4 py-4 space-y-3">
                  <Button className="w-full" onClick={goToEdit}>
                    Edit flat
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-rose-700 border-rose-200 hover:bg-rose-50"
                    onClick={openDelete}
                  >
                    Delete flat
                  </Button>

                  <p className="text-xs text-slate-500">
                    Deleting a flat removes its members, tasks and expenses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DELETE MODAL */}
          {deleteOpen ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              <button
                type="button"
                aria-label="Close delete modal"
                onClick={closeDelete}
                className="absolute inset-0 bg-black/40"
              />
              <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Delete “{flat?.name}”?
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    This action cannot be undone.
                    {flatNameForDelete ? ` Type the flat name to confirm.` : ""}
                  </p>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {flatNameForDelete ? (
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        Type:{" "}
                        <span className="font-semibold">
                          {flatNameForDelete}
                        </span>
                      </p>
                      <Input
                        value={deleteText}
                        onChange={(e) => setDeleteText(e.target.value)}
                        placeholder={flatNameForDelete}
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      className="px-4 py-2"
                      onClick={closeDelete}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>

                    <Button
                      className="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700"
                      onClick={handleDeleteFlat}
                      disabled={
                        isDeleting ||
                        (flatNameForDelete &&
                          deleteText.trim() !== flatNameForDelete)
                      }
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* OVERLAY (Members/Expenses/Tasks) */}
      {overlay ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={closeOverlay}
            className="absolute inset-0 bg-black/30"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[85vh]">
            <div className="mx-auto w-full max-w-3xl px-4 pb-4">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {overlay === "expenses"
                        ? "Expenses"
                        : overlay === "members"
                        ? "Members"
                        : "Tasks"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {overlay === "expenses"
                        ? "Create and review shared expenses"
                        : overlay === "members"
                        ? isOwner
                          ? "Manage members"
                          : "Flat members"
                        : "Assign tasks and track progress"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="px-3 py-2"
                    onClick={closeOverlay}
                  >
                    Hide
                  </Button>
                </div>

                <div className="max-h-[75vh] overflow-auto px-4 py-4">
                  {/* MEMBERS */}
                  {overlay === "members" ? (
                    <div className="space-y-3">
                      <Card>
                        <CardHeader
                          title="Members"
                          subtitle={isOwner ? "Manage members" : "Flat members"}
                        />
                        <CardBody>
                          <ul className="space-y-2">
                            {flat.members.map((m) => (
                              <li
                                key={m._id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className="truncate text-sm font-semibold text-slate-900"
                                      title={m.email || ""}
                                    >
                                      {nameOrEmail(m)}
                                    </p>
                                    {m._id === flat.owner ? (
                                      <Pill tone="neutral">Owner</Pill>
                                    ) : null}
                                  </div>
                                  <p className="truncate text-xs text-slate-500">
                                    {m.email}
                                  </p>
                                </div>

                                {isOwner && m._id !== flat.owner ? (
                                  <Button
                                    variant="outline"
                                    className="px-3 py-2"
                                    onClick={() => handleRemoveMember(m._id)}
                                  >
                                    Remove
                                  </Button>
                                ) : null}
                              </li>
                            ))}
                          </ul>

                          {/* Pending invitations */}
                          {isOwner ? (
                            <div className="mt-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-900">
                                  Pending invitations
                                </p>
                                <Button
                                  variant="outline"
                                  className="px-3 py-2"
                                  onClick={getPendingInvites}
                                  disabled={invitesLoading}
                                >
                                  {invitesLoading ? "Refreshing…" : "Refresh"}
                                </Button>
                              </div>

                              {invitesError ? (
                                <p className="mt-2 text-xs text-rose-700">
                                  {invitesError}
                                </p>
                              ) : null}

                              {invitesLoading ? (
                                <div className="mt-2 h-16 rounded-2xl bg-slate-200/60 animate-pulse" />
                              ) : pendingInvites.length === 0 ? (
                                <p className="mt-2 text-xs text-slate-500">
                                  No pending invitations.
                                </p>
                              ) : (
                                <ul className="mt-2 space-y-2">
                                  {pendingInvites.map((inv) => (
                                    <li
                                      key={inv._id}
                                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                          {inv.email}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                          Expires: {fmtDateTime(inv.expiresAt)}
                                        </p>
                                      </div>

                                      <Button
                                        variant="outline"
                                        className="px-3 py-2 text-rose-700 border-rose-200 hover:bg-rose-50"
                                        onClick={() => revokeInvite(inv._id)}
                                      >
                                        Revoke
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ) : null}

                          {/* Invite form */}
                          {isOwner ? (
                            <form
                              onSubmit={handleAddMember}
                              className="mt-4 space-y-2"
                            >
                              <Input
                                type="email"
                                placeholder="friend@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={isInviting}
                              >
                                {isInviting ? "Sending…" : "Send invitation"}
                              </Button>

                              {inviteMsg ? (
                                <p className="text-xs text-emerald-700">
                                  {inviteMsg}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500">
                                  They’ll receive an email with an invite link.
                                </p>
                              )}
                            </form>
                          ) : null}
                        </CardBody>
                      </Card>
                    </div>
                  ) : null}

                  {/* EXPENSES */}
                  {overlay === "expenses" ? (
                    <div className="space-y-3">
                      <Card>
                        <CardHeader title="Add expense" subtitle="Keep it quick" />
                        <CardBody>
                          <ExpenseForm members={flat.members} onCreate={createExpense} />
                        </CardBody>
                      </Card>

                      {countsLoading ? (
                        <div className="h-24 rounded-2xl bg-slate-200/60 animate-pulse" />
                      ) : expenses.length === 0 ? (
                        <Card>
                          <CardBody>
                            <p className="text-sm text-slate-700">No expenses yet</p>
                          </CardBody>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {expenses.map((e) => {
                            const creatorId = e.createdBy?._id || e.createdBy || null;
                            const isCreator = creatorId && String(creatorId) === String(user?._id);
                            const isOpen = openExpenseId === e._id;

                            return (
                              <Card key={e._id}>
                                <CardBody>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                          {e.title}
                                        </p>
                                        <Pill tone="neutral">{formatMoney(e.amount)}</Pill>
                                      </div>
                                      <p className="mt-1 text-sm text-slate-700">
                                        Paid by: <UserName u={e.paidBy} />
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {e.category || "general"} · {fmtDate(e.date)}
                                      </p>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      className="px-3 py-2"
                                      onClick={() => toggleExpenseDetails(e._id)}
                                    >
                                      {isOpen ? "Hide" : "Details"}
                                    </Button>
                                  </div>

                                  {isOpen ? (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                                      <div>
                                        <span className="font-medium text-slate-900">
                                          Split between:
                                        </span>{" "}
                                        {Array.isArray(e.splitBetween) && e.splitBetween.length ? (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {e.splitBetween.map((m) => (
                                              <span
                                                key={m._id}
                                                className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                                              >
                                                {nameOrEmail(m)}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <span>-</span>
                                        )}
                                      </div>

                                      {e.notes ? <div className="mt-2">Notes: {e.notes}</div> : null}

                                      {e.imageUrl ? (
                                        <div className="mt-3">
                                          <p className="text-xs font-medium text-slate-700 mb-2">
                                            Receipt
                                          </p>
                                          <a href={e.imageUrl} target="_blank" rel="noreferrer">
                                            <img
                                              src={e.imageUrl}
                                              alt="Receipt"
                                              className="w-full max-h-72 object-cover rounded-xl ring-1 ring-slate-200"
                                            />
                                          </a>
                                        </div>
                                      ) : null}

                                      {isCreator ? (
                                        <div className="mt-3">
                                          <Button
                                            variant="outline"
                                            className="px-3 py-2 text-rose-700 border-rose-200 hover:bg-rose-50"
                                            onClick={() => deleteExpense(e._id)}
                                          >
                                            Delete expense
                                          </Button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </CardBody>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* TASKS */}
                  {overlay === "tasks" ? (
                    <div className="space-y-3">
                      <Card>
                        <CardHeader title="Add task" subtitle="Create and optionally assign it" />
                        <CardBody>
                          <TaskForm members={flat.members} onCreate={createTask} />
                        </CardBody>
                      </Card>

                      {countsLoading ? (
                        <div className="h-24 rounded-2xl bg-slate-200/60 animate-pulse" />
                      ) : sortedTasks.length === 0 ? (
                        <Card>
                          <CardBody>
                            <p className="text-sm text-slate-700">No tasks yet</p>
                          </CardBody>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {sortedTasks.map((t) => {
                            const assignedId = t.assignedTo?._id || t.assignedTo || null;
                            const creatorId = t.createdBy?._id || t.createdBy || null;

                            const isAssignedToMe =
                              assignedId && String(assignedId) === String(user?._id);
                            const isCreator =
                              creatorId && String(creatorId) === String(user?._id);
                            const isOpen = openTaskId === t._id;

                            return (
                              <Card key={t._id}>
                                <CardBody>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                          {t.title}
                                        </p>
                                        <Pill tone={statusTone(t.status)}>
                                          {statusLabel(t.status)}
                                        </Pill>
                                      </div>
                                      <p className="mt-1 text-sm text-slate-700">
                                        Assigned to:{" "}
                                        <span className="font-medium text-slate-900">
                                          {t.assignedTo ? nameOrEmail(t.assignedTo) : "Unassigned"}
                                        </span>
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                      {!assignedId ? (
                                        <Button
                                          variant="outline"
                                          className="px-3 py-2"
                                          onClick={() => assignTaskToMe(t._id)}
                                        >
                                          Assign to me
                                        </Button>
                                      ) : null}

                                      {isAssignedToMe && t.status === "pending" ? (
                                        <Button className="px-3 py-2" onClick={() => startTask(t._id)}>
                                          Start
                                        </Button>
                                      ) : null}

                                      {isAssignedToMe && t.status === "doing" ? (
                                        <Button className="px-3 py-2" onClick={() => markTaskDone(t._id)}>
                                          Done
                                        </Button>
                                      ) : null}

                                      <Button
                                        variant="ghost"
                                        className="px-3 py-2"
                                        onClick={() => toggleTaskDetails(t._id)}
                                      >
                                        {isOpen ? "Hide" : "Details"}
                                      </Button>
                                    </div>
                                  </div>

                                  {isOpen ? (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                                      <div>
                                        <span className="font-medium text-slate-900">Created by:</span>{" "}
                                        <span title={t.createdBy?.email || ""}>
                                          {t.createdBy ? nameOrEmail(t.createdBy) : "Unknown"}
                                        </span>
                                      </div>

                                      <div className="mt-2">
                                        <span className="font-medium text-slate-900">Created at:</span>{" "}
                                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                                      </div>

                                      {t.description ? <div className="mt-2">Notes: {t.description}</div> : null}

                                      {t.imageUrl ? (
                                        <div className="mt-3">
                                          <p className="text-xs font-medium text-slate-700 mb-2">Photo</p>
                                          <a href={t.imageUrl} target="_blank" rel="noreferrer">
                                            <img
                                              src={t.imageUrl}
                                              alt="Task"
                                              className="w-full max-h-72 object-cover rounded-xl ring-1 ring-slate-200"
                                            />
                                          </a>
                                        </div>
                                      ) : null}

                                      {isCreator ? (
                                        <div className="mt-3">
                                          <Button
                                            variant="outline"
                                            className="px-3 py-2 text-rose-700 border-rose-200 hover:bg-rose-50"
                                            onClick={() => deleteTask(t._id)}
                                          >
                                            Delete task
                                          </Button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </CardBody>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ResponsiveLayout>
  );
}

export default FlatDetails;
