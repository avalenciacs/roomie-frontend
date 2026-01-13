import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;