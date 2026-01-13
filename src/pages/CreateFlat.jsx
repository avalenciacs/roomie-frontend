import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function CreateFlat() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      await api.post(
        "/api/flats",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error creating flat");
    }
  };

  return (
    <div>
      <h2>Create Flat</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Flat name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateFlat;
