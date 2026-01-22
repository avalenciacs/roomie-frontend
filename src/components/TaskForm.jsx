
import { useMemo, useState } from "react";
import { uploadImage } from "../api/uploads";
import FilePicker from "./FilePicker";
import { useToast } from "../context/toast.context";

export default function TaskForm({ members = [], onCreate }) {
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(""); // "" = sin asignar

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

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
        description: description.trim(),
        assignedTo: assignedTo || null,
        imageUrl,
      };

      await onCreate(payload);

      toast.success("Tarea creada");

      // reset
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error creando la tarea");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm font-medium text-slate-700">Título *</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Limpiar cocina"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Notas</label>
        <textarea
          className="mt-1 w-full min-h-[90px] rounded-lg border border-slate-300 px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles opcionales..."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Asignar a
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Puedes dejarla sin asignar y asignarte después.
          </p>
        </div>

        <div>
          <FilePicker
            label="Foto (opcional)"
            helper="Máx 5MB. JPG/PNG/WebP."
            accept="image/*"
            value={file}
            onChange={setFile}
          />
        </div>
      </div>

      <button
        disabled={!canSubmit || isUploading}
        className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isUploading ? "Subiendo..." : "Crear tarea"}
      </button>
    </form>
  );
}
