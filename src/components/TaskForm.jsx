import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input } from "./ui/ui";
import api from "../api/api";

export default function TaskForm({ members = [], onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      let imageUrl = "";

      // 1️⃣ Upload image to Cloudinary (si hay)
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await api.post("/api/upload", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        imageUrl = uploadRes.data.imageUrl;
      }

      // 2️⃣ Create task
      await onCreate({
        title,
        description,
        assignedTo: assignedTo || null,
        imageUrl,
      });

      // 3️⃣ Reset form
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setImageFile(null);
    } catch (err) {
      console.error("Error creating task", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Add task"
        subtitle="Create and optionally assign it"
      />

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean kitchen"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              rows={3}
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Assign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Assign to
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="block w-full text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Max 5MB · JPG / PNG / WebP
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create task"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
