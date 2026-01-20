import { useMemo, useState } from "react";
import { uploadImage } from "../api/uploads";
import FilePicker from "./FilePicker";
import { useToast } from "../context/toast.context";
import { Button, Card, CardBody, CardHeader, Input, Pill } from "./ui/ui";

function TaskForm({ members = [], onCreate }) {
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const nameOrEmail = (u) => u?.name || u?.email || "User";
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

      await onCreate({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo || null,
        imageUrl, // "" si no hay
      });

      toast.success("Task created");

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error creating task");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Add task"
        subtitle="Create a task and optionally attach a photo"
        right={<Pill tone="neutral">New</Pill>}
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Title
              </label>
              <Input
                placeholder="e.g. Take out the trash"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Notes (optional)
              </label>
              <Input
                placeholder="Any details…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Assigned to
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id} title={m.email}>
                    {nameOrEmail(m)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                If unassigned, someone can claim it later.
              </p>
            </div>

            <FilePicker
              label="Photo (optional)"
              helper="Max 5MB. JPG/PNG/WebP."
              accept="image/*"
              value={file}
              onChange={setFile}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Create task"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export default TaskForm;
