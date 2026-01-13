import { useState } from "react";

function ExpenseForm({ members, onCreate }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [category, setCategory] = useState("other");

  const toggleSplit = (id) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      title,
      amount: Number(amount),
      paidBy,
      splitBetween,
      category,
    });
    setTitle("");
    setAmount("");
    setPaidBy("");
    setSplitBetween([]);
    setCategory("other");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add expense</h4>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <label>Paid by</label>
      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
        <option value="">Select</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.email}
          </option>
        ))}
      </select>

      <label>Split between</label>
      {members.map((m) => (
        <div key={m._id}>
          <input
            type="checkbox"
            checked={splitBetween.includes(m._id)}
            onChange={() => toggleSplit(m._id)}
          />
          <span>{m.email}</span>
        </div>
      ))}

      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="groceries">groceries</option>
        <option value="rent">rent</option>
        <option value="bills">bills</option>
        <option value="other">other</option>
      </select>

      <button type="submit">Create</button>
    </form>
  );
}

export default ExpenseForm;
