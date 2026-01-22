// frontend/src/components/TaskForm.jsx
import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "./ui/ui";

const EMPTY = {
  title: "",
  description: "",
  assignedTo: "",
  imageUrl: "",
};

export default function TaskForm({ members = [], onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Si cambia la lista de miembros y el assignedTo ya no existe, lo limpiamos
  useEffect(() => {
    if (!form.assignedTo) return;
    const exists = members.some(
      (m) => String(m?._id) === String(form.assignedTo),
    );
    if (!exists) setForm((p) => ({ ...p, assignedTo: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const canSubmit = useMemo(() => {
    return Boolean(form.title.trim()) && typeof onCreate === "function" && !submitting;
  }, [form.title, onCreate, submitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (typeof onCreate !== "function") {
      setErrorMsg("TaskForm: missing onCreate prop.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      assignedTo: form.assignedTo || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
    };

    try {
      setSubmitting(true);
      await onCreate(payload); // esto llama a tu createTask() en FlatDetails
      setForm(EMPTY);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Error creating task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="text-xs font-medium text-slate-700">Title *</p>
        <Input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Clean kitchen"
          required
        />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-700">Notes</p>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional details..."
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-slate-700">Assign to</p>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m?.name || m?.email || "Member"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-700">Photo URL</p>
          <Input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
      </div>

      {errorMsg ? <p className="text-xs text-rose-700">{errorMsg}</p> : null}

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {submitting ? "Creating..." : "Create task"}
      </Button>
    </form>
  );
}
