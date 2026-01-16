import { useState } from "react";
import { Button, Input } from "./ui/ui";

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "rent", label: "Rent" },
  { value: "food", label: "Food" },
  { value: "bills", label: "Bills" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

export default function ExpenseForm({ members = [], onCreate }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members?.[0]?._id || "");
  const [splitBetween, setSplitBetween] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");

  const toggleSplit = (id) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: title.trim(),
      amount: Number(amount),
      paidBy,
      splitBetween: splitBetween.length
        ? splitBetween
        : members.map((m) => m._id),
      date,
      category,
      notes: notes.trim(),
    };

    onCreate(payload);

    setTitle("");
    setAmount("");
    setCategory("general");
    setNotes("");
    setSplitBetween([]);
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Groceries"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Amount</label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="25.50"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Paid by</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Notes (optional)
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything relevant…"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">Split between</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {members.map((m) => {
            const checked = splitBetween.includes(m._id);
            return (
              <button
                type="button"
                key={m._id}
                onClick={() => toggleSplit(m._id)}
                className={[
                  "rounded-full px-3 py-1 text-xs ring-1",
                  checked
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {m.name || m.email}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          If you don’t select anyone, it will split between all members.
        </p>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Add expense
      </Button>
    </form>
  );
}
