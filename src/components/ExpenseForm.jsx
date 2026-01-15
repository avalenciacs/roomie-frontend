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

  const CATEGORIES = [
    { value: "general", label: "General" },
    { value: "rent", label: "Rent" },
    { value: "food", label: "Food" },
    { value: "bills", label: "Bills" },
    { value: "transport", label: "Transport" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" },
    { value: "other", label: "Other" },
  ];

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900">Add expense</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Title</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Supermarket"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Amount</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Category</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Paid by</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            <option value="">Select</option>
            {memberOptions.map((m) => (
              <option key={m._id} value={m._id} title={m.email}>
                {nameOrEmail(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-600">Split between</p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {memberOptions.map((m) => (
            <label key={m._id} className="flex items-center gap-2 text-sm" title={m.email}>
              <input
                type="checkbox"
                checked={splitBetween.includes(m._id)}
                onChange={() => toggleSplit(m._id)}
              />
              <span className="text-slate-900">{nameOrEmail(m)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600">Notes (optional)</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Create expense
      </button>
    </form>
  );
}

export default ExpenseForm;
