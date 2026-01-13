import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";

function FlatDetails() {
  const [flat, setFlat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");

  const { flatId } = useParams();
  const { user } = useContext(AuthContext);

  const token = localStorage.getItem("authToken");

  const getFlat = async () => {
    try {
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/api/flats/${flatId}/members`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmail("");
      getFlat();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Error adding member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/api/flats/${flatId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getFlat();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Error removing member");
    }
  };

  if (isLoading) return <p>Loading flat...</p>;
  if (!flat) return <p>Flat not found</p>;

  const isOwner = user && flat.owner && String(flat.owner) === String(user._id);

  return (
    <div>
      <Link to="/">← Back</Link>
      <h2>{flat.name}</h2>
      <p>{flat.description}</p>

      <h3>Members</h3>
      <ul>
        {flat.members?.map((member) => (
          <li key={member._id}>
            {member.email}
            {isOwner && member._id !== flat.owner && (
              <button onClick={() => handleRemoveMember(member._id)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <>
          <h4>Add member</h4>
          <form onSubmit={handleAddMember}>
            <input
              type="email"
              placeholder="member@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </>
      )}
    </div>
  );
}

export default FlatDetails;
