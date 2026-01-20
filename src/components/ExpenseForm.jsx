import { useMemo, useState } from "react";
import { uploadImage } from "../api/uploads";
import FilePicker from "./FilePicker";
import { useToast } from "../context/toast.context";

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
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members?.[0]?._id || "");
  const [splitBetween, setSplitBetween] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim() && Number(amount) > 0 && paidBy;
  }, [title, amount, paidBy]);

  const toggleSplit = (id) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      let imageUrl = "";

      if (file) {
        setIsUploading(true);
        imageUrl = await uploadImage(file);
      }

      const payload = {
        title: title.trim(),
        amount: Number(amount),
        paidBy,
        splitBetween,
        date,
        category,
        notes: notes.trim(),
        imageUrl,
      };

      await onCreate(payload);

      toast.success("Expense created");

      // reset
      setTitle("");
      setAmount("");
      setPaidBy(members?.[0]?._id || "");
      setSplitBetween([]);
      setDate(new Date().toISOString().slice(0, 10));
      setCategory("general");
      setNotes("");
      setFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error creating expense");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Groceries"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Amount</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="25.50"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Paid by</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            <option value="">Select</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Split between (optional)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => toggleSplit(m._id)}
              className={`rounded-full px-3 py-1 text-sm ring-1 ${
                splitBetween.includes(m._id)
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {m.name || m.email}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          If empty, backend will split between all members.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
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
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <FilePicker
        label="Photo (optional)"
        helper="Max 5MB. JPG/PNG/WebP."
        accept="image/*"
        value={file}
        onChange={setFile}
      />

      <button
        disabled={!canSubmit || isUploading}
        className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isUploading ? "Uploading..." : "Add expense"}
      </button>
    </form>
  );
}
