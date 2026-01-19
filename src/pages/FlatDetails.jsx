// src/pages/FlatDetails.jsx
import {
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ExpenseForm from "../components/ExpenseForm";
import TaskForm from "../components/TaskForm";
import ResponsiveLayout from "../components/ResponsiveLayout";
import FlatTopNav from "../components/FlatTopNav";
import { Card, CardBody, CardHeader, Button, Input, Pill } from "../components/ui/ui";

function FlatDetails() {
  const { flatId } = useParams();
  const { user } = useContext(AuthContext);

  const [flat, setFlat] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [openTaskId, setOpenTaskId] = useState(null);
  const [openExpenseId, setOpenExpenseId] = useState(null);

  const [overlay, setOverlay] = useState(""); // "expenses" | "members" | "tasks" | ""
  const scrollYRef = useRef(0);

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

  const isOwner = flat && String(flat.owner) === String(user?._id);

  // ───────── FETCH ─────────
  const getFlat = useCallback(async () => {
    const res = await api.get(`/api/flats/${flatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFlat(res.data);
  }, [flatId, token]);

  const getExpenses = useCallback(async () => {
    const res = await api.get(`/api/flats/${flatId}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);
  }, [flatId, token]);

  const getTasks = useCallback(async () => {
    const res = await api.get(`/api/flats/${flatId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  }, [flatId, token]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      setPageError("");
      try {
        await Promise.all([getFlat(), getExpenses(), getTasks()]);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Something went wrong while loading this flat.";
        if (alive) setPageError(msg);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [getFlat, getExpenses, getTasks]);

  // ───────── OVERLAY ─────────
  const openOverlay = (id) => {
    scrollYRef.current = window.scrollY || 0;
    document.body.style.overflow = "hidden";
    setOverlay(id);

    // opcional: cerrar “details” al cambiar de overlay
    setOpenExpenseId(null);
    setOpenTaskId(null);
  };

  const closeOverlay = () => {
    document.body.style.overflow = "";
    setOverlay("");
    requestAnimationFrame(() => window.scrollTo(0, scrollYRef.current || 0));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && overlay) closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay]);

  // ───────── MEMBERS ─────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/api/flats/${flatId}/members`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmail("");
      await getFlat();
    } catch (error) {
      alert(error?.response?.data?.message || "Error adding member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    const ok = window.confirm("Remove this member from the flat?");
    if (!ok) return;

    try {
      await api.delete(`/api/flats/${flatId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await getFlat();
    } catch (error) {
      alert(error?.response?.data?.message || "Error removing member");
    }
  };

  // ───────── EXPENSES ─────────
  const createExpense = async (expenseData) => {
    try {
      await api.post(`/api/flats/${flatId}/expenses`, expenseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await getExpenses();
    } catch (error) {
      alert(error?.response?.data?.message || "Error creating expense");
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
      await getExpenses();
    } catch (error) {
      alert(error?.response?.data?.message || "Error deleting expense");
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
      await getTasks();
    } catch (error) {
      alert(error?.response?.data?.message || "Error creating task");
    }
  };

  const assignTaskToMe = async (taskId) => {
    try {
      await api.put(
        `/api/tasks/${taskId}`,
        { assignedTo: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getTasks();
    } catch (error) {
      alert(error?.response?.data?.message || "Error assigning task");
    }
  };

  const startTask = async (taskId) => {
    try {
      await api.put(
        `/api/tasks/${taskId}`,
        { status: "doing" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getTasks();
    } catch (error) {
      alert(error?.response?.data?.message || "Error starting task");
    }
  };

  const markTaskDone = async (taskId) => {
    try {
      await api.put(
        `/api/tasks/${taskId}`,
        { status: "done" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getTasks();
    } catch (error) {
      alert(error?.response?.data?.message || "Error marking task done");
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
      await getTasks();
    } catch (error) {
      alert(error?.response?.data?.message || "Error deleting task");
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

  const SectionCard = ({ title, subtitle, count, onClick }) => (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card className="transition hover:shadow-sm">
        <CardBody>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="neutral">{count}</Pill>
              <span className="text-sm font-medium text-slate-700">Show</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </button>
  );

  // ───────── STATES ─────────
  if (isLoading) {
    return (
      <ResponsiveLayout
        top={
          <FlatTopNav
            flatId={flatId}
            title="Loading…"
            subtitle=""
          />
        }
        hideHeader
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout
        top={<FlatTopNav flatId={flatId} title="Flat" subtitle="" />}
        hideHeader
      >
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Flat not found</p>
            {pageError ? (
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            ) : null}
            <div className="mt-4">
              <Link to="/flats">
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



      {/* Launcher cards */}
      <div className="mt-4 space-y-3">
        <SectionCard
          title="Members"
          subtitle={isOwner ? "Manage members" : "Flat members"}
          count={flat.members?.length || 0}
          onClick={() => openOverlay("members")}
        />

        <SectionCard
          title="Expenses"
          subtitle="Create and review shared expenses"
          count={expenses.length}
          onClick={() => openOverlay("expenses")}
        />

        <SectionCard
          title="Tasks"
          subtitle="Assign tasks and track progress"
          count={tasks.length}
          onClick={() => openOverlay("tasks")}
        />
      </div>

      {/* OVERLAY */}
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

                          {isOwner ? (
                            <form
                              onSubmit={handleAddMember}
                              className="mt-4 space-y-2"
                            >
                              <Input
                                type="email"
                                placeholder="member@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                              <Button type="submit" className="w-full">
                                Add member
                              </Button>
                              <p className="text-xs text-slate-500">
                                Tip: members must have an account first.
                              </p>
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
                          <ExpenseForm
                            members={flat.members}
                            onCreate={createExpense}
                          />
                        </CardBody>
                      </Card>

                      {expenses.length === 0 ? (
                        <Card>
                          <CardBody>
                            <p className="text-sm text-slate-700">No expenses yet</p>
                          </CardBody>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {expenses.map((e) => {
                            const creatorId = e.createdBy?._id || e.createdBy || null;
                            const isCreator =
                              creatorId && String(creatorId) === String(user?._id);
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
                                        {Array.isArray(e.splitBetween) &&
                                        e.splitBetween.length ? (
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
                        <CardHeader
                          title="Add task"
                          subtitle="Create and optionally assign it"
                        />
                        <CardBody>
                          <TaskForm members={flat.members} onCreate={createTask} />
                        </CardBody>
                      </Card>

                      {sortedTasks.length === 0 ? (
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
                                        <Button
                                          className="px-3 py-2"
                                          onClick={() => startTask(t._id)}
                                        >
                                          Start
                                        </Button>
                                      ) : null}

                                      {isAssignedToMe && t.status === "doing" ? (
                                        <Button
                                          className="px-3 py-2"
                                          onClick={() => markTaskDone(t._id)}
                                        >
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
                                        <span className="font-medium text-slate-900">
                                          Created by:
                                        </span>{" "}
                                        <span title={t.createdBy?.email || ""}>
                                          {t.createdBy ? nameOrEmail(t.createdBy) : "Unknown"}
                                        </span>
                                      </div>

                                      <div className="mt-2">
                                        <span className="font-medium text-slate-900">
                                          Created at:
                                        </span>{" "}
                                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                                      </div>

                                      {t.description ? (
                                        <div className="mt-2">Notes: {t.description}</div>
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
