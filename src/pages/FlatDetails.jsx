// FlatDetails.jsx
import { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ExpenseForm from "../components/ExpenseForm";
import TaskForm from "../components/TaskForm";
import ResponsiveLayout from "../components/ResponsiveLayout";
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

  const token = localStorage.getItem("authToken");

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
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  // ───────── FETCH (memoized) ─────────
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

  const toggleTaskDetails = (id) => setOpenTaskId((prev) => (prev === id ? null : id));
  const toggleExpenseDetails = (id) =>
    setOpenExpenseId((prev) => (prev === id ? null : id));

  // ───────── STATES ─────────
  if (isLoading) {
    return (
      <ResponsiveLayout title="Flat" subtitle="Loading…" backTo="/">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-56 animate-pulse rounded-2xl bg-slate-200/60 lg:col-span-1" />
          <div className="h-56 animate-pulse rounded-2xl bg-slate-200/60 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200/60 lg:col-span-2" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout title="Flat" backTo="/">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-900 font-semibold">Flat not found</p>
            {pageError ? (
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            ) : null}
            <div className="mt-4">
              <Link to="/">
                <Button>Back</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  const isOwner = String(flat.owner) === String(user?._id);

  return (
    <ResponsiveLayout
      title={flat.name}
      subtitle={flat.description || "Shared flat workspace"}
      backTo="/"
      right={
        <div className="flex items-center gap-2">
          <Link to={`/flats/${flatId}/dashboard`}>
            <Button>Dashboard</Button>
          </Link>
          <Link to={`/flats/${flatId}/balance`}>
            <Button variant="outline">Balance</Button>
          </Link>
        </div>
      }
    >
      {pageError ? (
        <Card className="mb-4">
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Heads up</p>
            <p className="mt-1 text-sm text-slate-600">{pageError}</p>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* MEMBERS */}
        <Card className="lg:col-span-1">
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

                    {m._id !== flat.owner ? (
                      <p className="truncate text-xs text-slate-500">{m.email}</p>
                    ) : (
                      <p className="truncate text-xs text-slate-500">{m.email}</p>
                    )}
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
              <form onSubmit={handleAddMember} className="mt-4 space-y-2">
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
                  Tip: add members by email (they must have an account).
                </p>
              </form>
            ) : null}
          </CardBody>
        </Card>

        {/* MAIN */}
        <div className="lg:col-span-2 space-y-4">
          {/* QUICK STATS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-xs text-slate-500">Members</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {flat.members?.length || 0}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-slate-500">Expenses</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {expenses.length}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-slate-500">Open tasks</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {tasks.filter((t) => t.status !== "done").length}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* EXPENSES */}
          <Card>
            <CardHeader title="Expenses" subtitle="Create and review shared expenses" />
            <CardBody>
              <ExpenseForm members={flat.members} onCreate={createExpense} />
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
                            {(e.category || "general").toLowerCase()} · {fmtDate(e.date)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="px-3 py-2"
                            onClick={() => toggleExpenseDetails(e._id)}
                          >
                            {isOpen ? "Hide" : "Details"}
                          </Button>

                          {isCreator ? (
                            <Button
                              variant="outline"
                              className="px-3 py-2"
                              onClick={() => deleteExpense(e._id)}
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                          <div>
                            <span className="font-medium text-slate-900">Split between:</span>{" "}
                            {Array.isArray(e.splitBetween) && e.splitBetween.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {e.splitBetween.map((m) => (
                                  <span
                                    key={m._id}
                                    className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                                    title={m.email}
                                  >
                                    {nameOrEmail(m)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </div>

                          <div className="mt-3">
                            <span className="font-medium text-slate-900">Created by:</span>{" "}
                            <span title={e.createdBy?.email || ""}>
                              {e.createdBy ? nameOrEmail(e.createdBy) : "Unknown"}
                            </span>
                          </div>

                          {e.notes ? <div className="mt-2">Notes: {e.notes}</div> : null}
                        </div>
                      ) : null}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {/* TASKS */}
          <Card>
            <CardHeader title="Tasks" subtitle="Assign tasks and track progress" />
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

                const isAssignedToMe = assignedId && String(assignedId) === String(user?._id);
                const isCreator = creatorId && String(creatorId) === String(user?._id);
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
                            <Pill tone={statusTone(t.status)}>{statusLabel(t.status)}</Pill>
                          </div>

                          <p className="mt-1 text-sm text-slate-700">
                            Assigned to: <UserName u={t.assignedTo} fallback="Unassigned" />
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

                          {isCreator ? (
                            <Button
                              variant="outline"
                              className="px-3 py-2"
                              onClick={() => deleteTask(t._id)}
                            >
                              Delete
                            </Button>
                          ) : null}
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
                        </div>
                      ) : null}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}

export default FlatDetails;
