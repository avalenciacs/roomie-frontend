
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, Button } from "../components/ui/ui";
import FlatDashboard from "../components/FlatDashboard";

export default function FlatDashboardPage() {
  const { flatId } = useParams();
  const token = localStorage.getItem("authToken");

  const [flat, setFlat] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setPageError("");

      try {
        const [flatRes, expRes] = await Promise.all([
          api.get(`/api/flats/${flatId}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/api/flats/${flatId}/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!alive) return;
        setFlat(flatRes.data);
        setExpenses(expRes.data);
      } catch (err) {
        if (!alive) return;
        setPageError(err?.response?.data?.message || "Error loading dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [flatId, token]);

  if (loading) {
    return (
      <ResponsiveLayout title="Dashboard" subtitle="Loading…" backTo={`/flats/${flatId}`}>
        <div className="h-56 rounded-2xl bg-slate-200/60 animate-pulse" />
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout title="Dashboard" backTo={`/flats/${flatId}`}>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Dashboard not available</p>
            {pageError ? <p className="mt-1 text-sm text-slate-600">{pageError}</p> : null}
            <div className="mt-4">
              <Link to={`/flats/${flatId}`}>
                <Button>Back to flat</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="Dashboard"
      subtitle={`Flat · ${flat.name}`}
      backTo={`/flats/${flatId}`}
      right={
        <Link to={`/flats/${flatId}/balance`}>
          <Button variant="outline">Balance</Button>
        </Link>
      }
    >
      {pageError ? (
        <Card className="mb-4">
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Heads up</p>
            <p className="mt-1 text-sm text-slate-600">{pageError}</p>
          </CardBody>
        </Card>
      ) : null}

      <FlatDashboard expenses={expenses} />
    </ResponsiveLayout>
  );
}
