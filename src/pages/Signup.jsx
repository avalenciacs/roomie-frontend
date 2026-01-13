import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", {
        email,
        password,
        name,
      });

      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
