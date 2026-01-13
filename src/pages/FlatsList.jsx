import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";

function FlatsList() {
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  const getFlats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get("/api/flats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlats(response.data);
    } catch (error) {
      console.error(error);
      alert("Error loading flats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFlats();
  }, []);

  if (isLoading) return <p>Loading flats...</p>;

  return (
    <div>
      <h1>My Flats</h1>

      <button onClick={logout}>Logout</button>

      <div style={{ margin: "16px 0" }}>
        <Link to="/flats/create">+ Create Flat</Link>
      </div>

      {flats.length === 0 ? (
        <p>You have no flats yet.</p>
      ) : (
        <ul>
          {flats.map((flat) => (
            <li key={flat._id}>
              <Link to={`/flats/${flat._id}`}>{flat.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlatsList;
