import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Pill } from "./ui/ui";

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

  const allSelected = splitBetween.length === memberOptions.length && memberOptions.length > 0;

  const toggleAll = () => {
    if (allSelected) setSplitBetween([]);
    else setSplitBetween(memberOptions.map((m) => m._id));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Add expense"
        subtitle="Create a shared expense and split it fairly"
        right={<Pill tone="neutral">New</Pill>}
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Title
              </label>
              <Input
                placeholder="e.g. Supermarket"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Amount
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Category
              </label>
              <Input
                placeholder="e.g. food, rent, bills"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Paid by
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
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

          {/* Split between */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Split between</p>
                <p className="text-xs text-slate-500">
                  Select who participates in this expense
                </p>
              </div>

              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {memberOptions.map((m) => {
                const checked = splitBetween.includes(m._id);
                return (
                  <label
                    key={m._id}
                    title={m.email}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${
                      checked
                        ? "border-slate-300 bg-white"
                        : "border-slate-200 bg-white/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSplit(m._id)}
                      className="h-4 w-4"
                    />
                    <span className="truncate font-medium text-slate-900">
                      {nameOrEmail(m)}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      ({m.email})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Notes (optional)
            </label>
            <textarea
              placeholder="Add details if needed…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit">Create expense</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default ExpenseForm;
