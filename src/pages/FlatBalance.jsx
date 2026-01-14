import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";

function FlatBalance() {
  const { flatId } = useParams();
  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);

  const myEmail = useMemo(() => user?.email || null, [user]);

  const formatAmount = (n) => {
    const num = Number(n || 0);
    const sign = num > 0 ? "+" : num < 0 ? "−" : "";
    return `${sign}${Math.abs(num).toFixed(2)} €`;
  };

  // label profesional: Nombre (email pequeño)
  const formatUserLabel = (email) => {
    if (!email) return "Unknown user";
    const name = nameByEmail[email];
    return name ? `${name}` : email;
  };

  // Tooltip/secondary email
  const formatUserSecondary = (email) => {
    if (!email) return "";
    const name = nameByEmail[email];
    return name ? email : "";
  };

  // Construye un mapa email -> name desde flat.members
  const nameByEmail = useMemo(() => {
    const map = {};
    if (!flat?.members) return map;

    for (const m of flat.members) {
      if (m?.email) {
        map[m.email] = m.name || m.email;
      }
    }
    return map;
  }, [flat]);

  useEffect(() => {
    const load = async () => {
      try {
        // Balance
        const balanceRes = await api.get(`/api/flats/${flatId}/balance`);
        setData(balanceRes.data);

        // Flat detail (para sacar nombres)
        const flatRes = await api.get(`/api/flats/${flatId}`);
        setFlat(flatRes.data);
      } catch (e) {
        alert(e?.response?.data?.message || "Error loading balance");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [flatId]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Balance not available</p>;

  const totals = Array.isArray(data.totals) ? data.totals : [];
  const settlements = Array.isArray(data.settlements) ? data.settlements : [];

  // Formato backend actual: from/to son emails (string)
  const youOwe = myEmail ? settlements.filter((s) => s?.from === myEmail) : [];
  const youReceive = myEmail ? settlements.filter((s) => s?.to === myEmail) : [];

  return (
    <div>
      <Link to={`/flats/${flatId}`}>← Back to flat</Link>

      <h2>Balance</h2>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h3>You owe</h3>
          {!myEmail ? (
            <p>Loading user...</p>
          ) : youOwe.length === 0 ? (
            <p>Nothing 🎉</p>
          ) : (
            <ul>
              {youOwe.map((s, i) => (
                <li key={i} title={s?.to || ""}>
                  {formatUserLabel(s?.to)}{" "}
                  {formatUserSecondary(s?.to) && (
                    <small style={{ opacity: 0.7 }}>
                      ({formatUserSecondary(s?.to)})
                    </small>
                  )}{" "}
                  — {formatAmount(s?.amount)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h3>You receive</h3>
          {!myEmail ? (
            <p>Loading user...</p>
          ) : youReceive.length === 0 ? (
            <p>Nothing</p>
          ) : (
            <ul>
              {youReceive.map((s, i) => (
                <li key={i} title={s?.from || ""}>
                  {formatUserLabel(s?.from)}{" "}
                  {formatUserSecondary(s?.from) && (
                    <small style={{ opacity: 0.7 }}>
                      ({formatUserSecondary(s?.from)})
                    </small>
                  )}{" "}
                  — {formatAmount(s?.amount)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h3>Balance per person</h3>
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        {totals.length ? (
          <ul>
            {totals.map((t, idx) => (
              <li key={t?.userId || idx} title={t?.email || ""}>
                {formatUserLabel(t?.email)}{" "}
                {formatUserSecondary(t?.email) && (
                  <small style={{ opacity: 0.7 }}>
                    ({formatUserSecondary(t?.email)})
                  </small>
                )}{" "}
                — {formatAmount(t?.net)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No data yet</p>
        )}
        <small>Positive means receives, negative means owes.</small>
      </div>

      <h3 style={{ marginTop: 16 }}>Settlements</h3>
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        {settlements.length === 0 ? (
          <p>All settled ✅</p>
        ) : (
          <ul>
            {settlements.map((s, i) => (
              <li key={i}>
                <span title={s?.from || ""}>{formatUserLabel(s?.from)}</span>{" "}
                owes{" "}
                <span title={s?.to || ""}>{formatUserLabel(s?.to)}</span>{" "}
                <strong>{formatAmount(s?.amount)}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FlatBalance;
