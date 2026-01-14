import { useMemo, useState } from "react";

function ExpenseForm({ members, onCreate }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [notes, setNotes] = useState("");

  const nameOrEmail = (u) => u?.name || u?.email || "User";

  const memberOptions = useMemo(() => members || [], [members]);

  const toggleSplit = (id) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amt = Number(amount);
    if (Number.isNaN(amt) || amt < 0) return alert("Amount must be a number >= 0");
    if (!paidBy) return alert("Choose who paid");
    if (splitBetween.length === 0) return alert("Choose at least 1 participant");

    onCreate({
      title,
      amount: amt,
      category,
      paidBy,
      splitBetween,
      notes,
    });

    setTitle("");
    setAmount("");
    setCategory("general");
    setPaidBy("");
    setSplitBetween([]);
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <h4>Add expense</h4>

      <input
        placeholder="Title (e.g. Supermarket)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <input
        placeholder="Category (e.g. food, rent, bills)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <div style={{ marginTop: 8 }}>
        <label>Paid by: </label>
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
          <option value="">Select</option>
          {memberOptions.map((m) => (
            <option key={m._id} value={m._id} title={m.email}>
              {nameOrEmail(m)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <div>Split between:</div>
        {memberOptions.map((m) => (
          <label key={m._id} style={{ display: "block" }} title={m.email}>
            <input
              type="checkbox"
              checked={splitBetween.includes(m._id)}
              onChange={() => toggleSplit(m._id)}
            />
            {" "}
            {nameOrEmail(m)}
          </label>
        ))}
      </div>

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        style={{ marginTop: 8, width: "100%" }}
      />

      <button type="submit" style={{ marginTop: 8 }}>
        Create
      </button>
    </form>
  );
}

export default ExpenseForm;
