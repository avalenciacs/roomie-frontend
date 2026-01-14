import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

function FlatBalance() {
  const { flatId } = useParams();
  const token = localStorage.getItem("authToken");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const nameOrEmail = (u) => u?.name || u?.email || "User";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/flats/${flatId}/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (e) {
        alert(e?.response?.data?.message || "Error loading balance");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [flatId, token]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Balance not available</p>;

  const owes = data.settlementsForUser.filter((x) => x.type === "owe");
  const receives = data.settlementsForUser.filter((x) => x.type === "receive");

  return (
    <div>
      <Link to={`/flats/${flatId}`}>← Back to flat</Link>

      <h2>Balance</h2>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h3>You owe</h3>
          {owes.length === 0 ? (
            <p>Nothing 🎉</p>
          ) : (
            <ul>
              {owes.map((x, i) => (
                <li key={i} title={x.to.email}>
                  {nameOrEmail(x.to)} → {x.amount} €
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h3>You receive</h3>
          {receives.length === 0 ? (
            <p>Nothing</p>
          ) : (
            <ul>
              {receives.map((x, i) => (
                <li key={i} title={x.from.email}>
                  {nameOrEmail(x.from)} → {x.amount} €
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h3>Per user</h3>
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <ul>
          {data.perUser.map((x) => (
            <li key={x.user._id} title={x.user.email}>
              {nameOrEmail(x.user)} — {x.amount} €
            </li>
          ))}
        </ul>
        <small>Positive = receives, negative = owes</small>
      </div>
    </div>
  );
}

export default FlatBalance;
