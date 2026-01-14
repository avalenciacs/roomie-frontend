import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ExpenseForm from "../components/ExpenseForm";
import TaskForm from "../components/TaskForm";

function FlatDetails() {
  const { flatId } = useParams();
  const { user } = useContext(AuthContext);

  const [flat, setFlat] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [openTaskId, setOpenTaskId] = useState(null);
  const [openExpenseId, setOpenExpenseId] = useState(null);

  const token = localStorage.getItem("authToken");

  const nameOrEmail = (u) => u?.name || u?.email || "User";

  const UserNameWithTooltip = ({ u, fallback = "-" }) => {
    if (!u) return <span>{fallback}</span>;
    return <span title={u.email || ""}>{nameOrEmail(u)}</span>;
  };

  const statusLabel = (s) => {
    if (s === "pending") return "Pending";
    if (s === "doing") return "In progress";
    if (s === "done") return "Done";
    return s;
  };

  const badgeStyle = (s) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #ccc",
    marginLeft: 8,
    opacity: s === "done" ? 0.7 : 1,
  });

  // ───────── FETCH ─────────
  const getFlat = async () => {
    const res = await api.get(`/api/flats/${flatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFlat(res.data);
  };

  const getExpenses = async () => {
    const res = await api.get(`/api/flats/${flatId}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);
  };

  const getTasks = async () => {
    const res = await api.get(`/api/flats/${flatId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  useEffect(() => {
    Promise.all([
      getFlat().catch(() => alert("Error loading flat")),
      getExpenses().catch(() => alert("Error loading expenses")),
      getTasks().catch(() => alert("Error loading tasks")),
    ]).finally(() => setIsLoading(false));
    
  }, [flatId]);

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
      getFlat();
    } catch (error) {
      alert(error?.response?.data?.message || "Error adding member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/api/flats/${flatId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getFlat();
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
      getExpenses();
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
      getExpenses();
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
      getTasks();
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
      getTasks();
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
      getTasks();
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
      getTasks();
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
      getTasks();
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
  const toggleExpenseDetails = (id) => setOpenExpenseId((prev) => (prev === id ? null : id));

  if (isLoading) return <p>Loading...</p>;
  if (!flat) return <p>Flat not found</p>;

  const isOwner = String(flat.owner) === String(user._id);

  return (
    <div>
      <Link to="/">← Back</Link>

      <h2>{flat.name}</h2>
      <p>{flat.description}</p>

      <div style={{ marginBottom: 12 }}>
        <Link to={`/flats/${flatId}/balance`}>View Balance</Link>
      </div>

      {/* MEMBERS */}
      <h3>Members</h3>
      <ul>
        {flat.members.map((member) => (
          <li key={member._id} title={member.email || ""}>
            {nameOrEmail(member)}
            {member._id === flat.owner ? <span style={{ marginLeft: 8 }}>(Owner)</span> : null}
            {isOwner && member._id !== flat.owner && (
              <button onClick={() => handleRemoveMember(member._id)} style={{ marginLeft: 8 }}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={handleAddMember} style={{ marginBottom: 20 }}>
          <input
            type="email"
            placeholder="member@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" style={{ marginLeft: 8 }}>
            Add member
          </button>
        </form>
      )}

      {/* EXPENSES (pro) */}
      <h3>Expenses</h3>
      <ExpenseForm members={flat.members} onCreate={createExpense} />

      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {expenses.map((e) => {
            const creatorId = e.createdBy?._id || e.createdBy || null;
            const isCreator = creatorId && String(creatorId) === String(user._id);
            const isOpen = openExpenseId === e._id;

            return (
              <div
                key={e._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>{e.title}</strong>
                      <span style={badgeStyle("pending")}>{e.amount} €</span>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 14 }}>
                      Paid by: <UserNameWithTooltip u={e.paidBy} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <button onClick={() => toggleExpenseDetails(e._id)}>
                      {isOpen ? "Hide" : "Details"}
                    </button>
                    {isCreator && (
                      <button onClick={() => deleteExpense(e._id)}>Delete</button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 10, fontSize: 13, borderTop: "1px solid #eee", paddingTop: 10 }}>
                    <div>Category: {e.category || "general"}</div>
                    <div>
                      Split between:{" "}
                      {Array.isArray(e.splitBetween) && e.splitBetween.length > 0
                        ? e.splitBetween.map((m) => (
                            <span key={m._id} title={m.email} style={{ marginRight: 8 }}>
                              {nameOrEmail(m)}
                            </span>
                          ))
                        : "-"}
                    </div>
                    <div>
                      Created by:{" "}
                      <span title={e.createdBy?.email || ""}>
                        {e.createdBy ? nameOrEmail(e.createdBy) : "Unknown"}
                      </span>
                    </div>
                    <div>
                      Date: {e.date ? new Date(e.date).toLocaleDateString() : "-"}
                    </div>
                    {e.notes ? <div style={{ marginTop: 6 }}>Notes: {e.notes}</div> : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TASKS (pro) */}
      <h3 style={{ marginTop: 24 }}>Tasks</h3>
      <TaskForm members={flat.members} onCreate={createTask} />

      {sortedTasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {sortedTasks.map((t) => {
            const assignedId = t.assignedTo?._id || t.assignedTo || null;
            const creatorId = t.createdBy?._id || t.createdBy || null;

            const isAssignedToMe = assignedId && String(assignedId) === String(user._id);
            const isCreator = creatorId && String(creatorId) === String(user._id);
            const isOpen = openTaskId === t._id;

            return (
              <div
                key={t._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>{t.title}</strong>
                      <span style={badgeStyle(t.status)}>{statusLabel(t.status)}</span>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 14 }}>
                      Assigned to: <UserNameWithTooltip u={t.assignedTo} fallback="Unassigned" />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    {!assignedId && (
                      <button onClick={() => assignTaskToMe(t._id)}>Assign to me</button>
                    )}
                    {isAssignedToMe && t.status === "pending" && (
                      <button onClick={() => startTask(t._id)}>Start</button>
                    )}
                    {isAssignedToMe && t.status === "doing" && (
                      <button onClick={() => markTaskDone(t._id)}>Done</button>
                    )}

                    <button onClick={() => toggleTaskDetails(t._id)}>
                      {isOpen ? "Hide" : "Details"}
                    </button>

                    {isCreator && <button onClick={() => deleteTask(t._id)}>Delete</button>}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 10, fontSize: 13, borderTop: "1px solid #eee", paddingTop: 10 }}>
                    <div>
                      Created by:{" "}
                      <span title={t.createdBy?.email || ""}>
                        {t.createdBy ? nameOrEmail(t.createdBy) : "Unknown"}
                      </span>
                    </div>
                    <div>
                      Created at: {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                    </div>
                    {t.description ? <div style={{ marginTop: 6 }}>Notes: {t.description}</div> : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FlatDetails;

