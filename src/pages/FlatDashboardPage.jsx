// src/pages/FlatDashboardPage.jsx
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

  // ───────── TOP NAV (igual a FlatDetails) ─────────
  const SegmentedTopNav = (
    <div className="bg-white border-b border-slate-200">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="py-3">
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <Link
              to={`/flats/${flatId}`}
              className="px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Flat
            </Link>

            <Link
              to={`/flats/${flatId}/dashboard`}
              className="px-3 py-2 text-center text-sm font-medium bg-slate-900 text-white"
            >
              Dashboard
            </Link>

            <Link
              to={`/flats/${flatId}/balance`}
              className="px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Balance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ResponsiveLayout top={SegmentedTopNav} hideHeader>
        <div className="space-y-4">
          <div className="h-56 rounded-2xl bg-slate-200/60 animate-pulse" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!flat) {
    return (
      <ResponsiveLayout top={SegmentedTopNav} hideHeader>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">
              Dashboard not available
            </p>
            {pageError ? (
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            ) : null}
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
    <ResponsiveLayout top={SegmentedTopNav} hideHeader>
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
