import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ExpenseForm from "../components/ExpenseForm";

function FlatDetails() {
  const { flatId } = useParams();
  const { user } = useContext(AuthContext);

  const [flat, setFlat] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  // ─────────────────────────
  // FETCH FLAT
  // ─────────────────────────
  const getFlat = async () => {
    try {
      const response = await api.get(`/api/flats/${flatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlat(response.data);
    } catch (error) {
      console.error(error);
      alert("Error loading flat");
    }
  };

  // ─────────────────────────
  // FETCH EXPENSES
  // ─────────────────────────
  const getExpenses = async () => {
    try {
      const response = await api.get(`/api/flats/${flatId}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error(error);
      alert("Error loading expenses");
    }
  };

  useEffect(() => {
    Promise.all([getFlat(), getExpenses()]).finally(() =>
      setIsLoading(false)
    );
  }, [flatId]);

  // ─────────────────────────
  // MEMBERS
  // ─────────────────────────
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
      console.error(error);
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
      console.error(error);
      alert(error?.response?.data?.message || "Error removing member");
    }
  };

  // ─────────────────────────
  // EXPENSES
  // ─────────────────────────
  const createExpense = async (expenseData) => {
    try {
      await api.post(
        `/api/flats/${flatId}/expenses`,
        expenseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getExpenses();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Error creating expense");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!flat) return <p>Flat not found</p>;

  const isOwner = user && String(flat.owner) === String(user._id);

  return (
    <div>
      <Link to="/">← Back</Link>

      <h2>{flat.name}</h2>
      <p>{flat.description}</p>

      {/* ───────── MEMBERS ───────── */}
      <h3>Members</h3>
      <ul>
        {flat.members.map((member) => (
          <li key={member._id}>
            {member.email}
            {isOwner && member._id !== flat.owner && (
              <button onClick={() => handleRemoveMember(member._id)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <>
          <h4>Add member</h4>
          <form onSubmit={handleAddMember}>
            <input
              type="email"
              placeholder="member@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>
        </>
      )}

      {/* ───────── EXPENSES ───────── */}
      <h3>Expenses</h3>

      <ExpenseForm
        members={flat.members}
        onCreate={createExpense}
      />

      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <ul>
          {expenses.map((expense) => (
            <li key={expense._id}>
              <strong>{expense.title}</strong> — {expense.amount} €  
              <br />
              Paid by: {expense.paidBy?.email}
              <br />
              Category: {expense.category}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlatDetails;
