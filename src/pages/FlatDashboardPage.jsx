import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody } from "../components/ui/ui";
import FlatDashboard from "../components/FlatDashboard";
import FlatTopNav from "../components/FlatTopNav";

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
          api.get(`/api/flats/${flatId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/api/flats/${flatId}/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
      <ResponsiveLayout top={<FlatTopNav flatId={flatId} />} hideHeader>
        <div className="h-56 rounded-2xl bg-slate-200/60 animate-pulse" />
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout top={<FlatTopNav flatId={flatId} />} hideHeader>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">
              Dashboard not available
            </p>
            {pageError ? (
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            ) : null}
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout top={<FlatTopNav flatId={flatId} />} hideHeader>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Dashboard</p>
          <p className="text-xs text-slate-500">Flat · {flat.name}</p>
        </div>

        {pageError ? (
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-slate-900">Heads up</p>
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            </CardBody>
          </Card>
        ) : null}

        <FlatDashboard expenses={expenses} />
      </div>
    </ResponsiveLayout>
  );
}
