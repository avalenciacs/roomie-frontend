import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

function Balance() {
  const { flatId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  const getBalance = async () => {
    try {
      const response = await api.get(`/api/flats/${flatId}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error(error);
      alert("Error loading balance");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBalance();
  }, [flatId]);

  if (isLoading) return <p>Loading balance...</p>;
  if (!data) return <p>No balance data</p>;

  return (
    <div>
      <Link to={`/flats/${flatId}`}>← Back to flat</Link>

      <h2>Balance</h2>

      <h3>Totals</h3>
      <ul>
        {data.totals.map((t) => (
          <li key={t.userId}>
            {t.email}: {t.net} €
          </li>
        ))}
      </ul>

      <h3>Who pays who</h3>
      {data.settlements.length === 0 ? (
        <p>All settled ✅</p>
      ) : (
        <ul>
          {data.settlements.map((s, idx) => (
            <li key={idx}>
              {s.from} pays {s.to}: {s.amount} €
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Balance;
