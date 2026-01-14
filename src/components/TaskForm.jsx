import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Pill } from "./ui/ui";

function TaskForm({ members, onCreate }) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const nameOrEmail = (u) => u?.name || u?.email || "User";
  const memberOptions = useMemo(() => members || [], [members]);

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate({
      title,
      assignedTo: assignedTo || null,
    });

    setTitle("");
    setAssignedTo("");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Add task"
        subtitle="Create a task and optionally assign it"
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
                placeholder="e.g. Take out the trash"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Assigned to
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">Unassigned</option>
                {memberOptions.map((m) => (
                  <option key={m._id} value={m._id} title={m.email}>
                    {nameOrEmail(m)}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-slate-500">
                If unassigned, someone can claim it later.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit">Create task</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default TaskForm;
