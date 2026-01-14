import { useState } from "react";

function TaskForm({ members, onCreate }) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const nameOrEmail = (u) => u?.name || u?.email || "User";

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
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <h4>Add task</h4>

      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m._id} value={m._id} title={m.email}>
            {nameOrEmail(m)}
          </option>
        ))}
      </select>

      <button type="submit">Create</button>
    </form>
  );
}

export default TaskForm;
