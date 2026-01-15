import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, CardHeader, Button, Pill } from "../components/ui/ui";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function FlatDashboard() {
  const { flatId } = useParams();
  const token = localStorage.getItem("authToken");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const money = (n) => `${Number(n || 0).toFixed(2)} €`;

  const categoryLabel = (c) => {
    const map = {
      general: "General",
      rent: "Rent",
      food: "Food",
      bills: "Bills",
      transport: "Transport",
      shopping: "Shopping",
      entertainment: "Entertainment",
      other: "Other",
    };
    return map[c] || c;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/flats/${flatId}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (e) {
        alert(e?.response?.data?.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [flatId, token]);

  const pieData = useMemo(() => {
    const arr = data?.charts?.byCategory || [];
    return arr.map((x) => ({ name: categoryLabel(x.name), value: x.total }));
  }, [data]);

  const barData = useMemo(() => {
    const arr = data?.charts?.byUser || [];
    // Recharts necesita keys consistentes
    return arr.map((x) => ({
      name: x.name,
      net: x.net,
      email: x.email,
    }));
  }, [data]);

  if (loading) {
    return (
      <ResponsiveLayout title="Dashboard" subtitle="Loading…" backTo={`/flats/${flatId}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse md:col-span-2" />
          <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!data) {
    return (
      <ResponsiveLayout title="Dashboard" backTo={`/flats/${flatId}`}>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-700">Dashboard not available.</p>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  const { flat, summary, recentExpenses } = data;

  return (
    <ResponsiveLayout
      title="Dashboard"
      subtitle={flat?.name ? `Flat · ${flat.name}` : "Flat"}
      backTo={`/flats/${flatId}`}
      right={
        <Link to={`/flats/${flatId}`}>
          <Button variant="outline">Open workspace</Button>
        </Link>
      }
    >
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="This month" subtitle={summary.monthLabel} />
          <CardBody>
            <p className="text-2xl font-semibold text-slate-900">{money(summary.monthTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">Total expenses created this month.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Members" subtitle="Active in this flat" />
          <CardBody>
            <p className="text-2xl font-semibold text-slate-900">{summary.membersCount}</p>
            <p className="mt-1 text-xs text-slate-500">People sharing expenses and tasks.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Tasks" subtitle="Pending / Doing" />
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-slate-900">{summary.pendingTasksCount}</p>
              <p className="mt-1 text-xs text-slate-500">Tasks that still need attention.</p>
            </div>
            <Pill tone={summary.pendingTasksCount ? "neg" : "neutral"}>
              {summary.pendingTasksCount ? "Action" : "OK"}
            </Pill>
          </CardBody>
        </Card>
      </div>

      {/* Charts + Recent */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts: Category donut */}
        <Card className="lg:col-span-2">
          <CardHeader title="Expenses by category" subtitle="Current month" />
          <CardBody>
            {pieData.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">No expenses this month yet.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add an expense and you’ll see this chart update automatically.
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} />
                    <Tooltip formatter={(v) => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent expenses */}
        <Card className="lg:col-span-1">
          <CardHeader title="Recent expenses" subtitle="Last 5" />
          <CardBody>
            {recentExpenses?.length ? (
              <ul className="space-y-2">
                {recentExpenses.map((e) => (
                  <li key={e._id} className="rounded-xl border border-slate-200 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{e.title}</p>
                        <p className="text-xs text-slate-500" title={e.paidBy?.email || ""}>
                          Paid by {e.paidBy?.name || e.paidBy?.email || "Unknown"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{money(e.amount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">No expenses yet.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Create your first expense from the flat workspace.
                </p>
              </div>
            )}

            <div className="mt-3">
              <Link to={`/flats/${flatId}`}>
                <Button className="w-full">Go to expenses</Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Bar: Net balance */}
        <Card className="lg:col-span-3">
          <CardHeader title="Balance by person" subtitle="Net balance (positive receives, negative owes)" />
          <CardBody>
            {barData.length === 0 ? (
              <p className="text-sm text-slate-700">No data yet.</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${v}€`} />
                    <Tooltip
                      formatter={(v) => money(v)}
                      labelFormatter={(label, payload) => {
                        const p = payload?.[0]?.payload;
                        return p?.email ? `${label} (${p.email})` : label;
                      }}
                    />
                    <Bar dataKey="net" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Link to={`/flats/${flatId}/balance`} className="sm:w-auto">
                <Button>Open balance</Button>
              </Link>
              <Link to={`/flats/${flatId}`} className="sm:w-auto">
                <Button variant="outline">Open workspace</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}

export default FlatDashboard;
