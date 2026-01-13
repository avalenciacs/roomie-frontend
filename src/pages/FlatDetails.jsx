import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

function FlatDetails() {
  const [flat, setFlat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { flatId } = useParams();

  const getFlat = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`/api/flats/${flatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlat(response.data);
    } catch (error) {
      console.error(error);
      alert("Error loading flat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFlat();
  }, [flatId]);

  if (isLoading) return <p>Loading flat...</p>;
  if (!flat) return <p>Flat not found</p>;

  return (
    <div>
      <Link to="/">← Back</Link>
      <h2>{flat.name}</h2>
      <p>{flat.description}</p>

      <h3>Members</h3>
      <ul>
        {flat.members?.map((member) => (
          <li key={member._id}>{member.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default FlatDetails;
