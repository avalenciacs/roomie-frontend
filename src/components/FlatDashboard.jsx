
import { useMemo } from "react";
import { Card, CardBody, CardHeader, Pill } from "./ui/ui";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const CATEGORY_COLORS = {
  General: "#64748b",        
  Rent: "#0f172a",           
  Food: "#22c55e",           
  Bills: "#3b82f6",          
  Transport: "#f59e0b",      
  Shopping: "#ec4899",       
  Entertainment: "#8b5cf6",  
  Other: "#6b7280",          
};

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
  return map[c] || c || "general";
};

const formatMoney = (n) => `${Number(n || 0).toFixed(2)} €`;

// Considera "mes actual" por date del expense
const isInCurrentMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export default function FlatDashboard({ expenses = [] }) {
  const { monthTotal, byCategory } = useMemo(() => {
    const currentMonth = expenses.filter((e) => isInCurrentMonth(e.date));
    const total = currentMonth.reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const map = new Map();
    for (const e of currentMonth) {
      const key = categoryLabel((e.category || "general").toLowerCase());
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    }

    const arr = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { monthTotal: total, byCategory: arr };
  }, [expenses]);

  const hasData = byCategory.length > 0;

  return (
    <Card>
      <CardHeader
        title="Dashboard"
        subtitle="Current month overview"
        right={<Pill tone="neutral">{formatMoney(monthTotal)}</Pill>}
      />

      <CardBody>
        {!hasData ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">No data yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Add expenses with categories to see charts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Expenses by category</p>
              <p className="text-xs text-slate-500">Current month</p>

              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Legend />
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={2}
                    >
                      {byCategory.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Top categories</p>
              <p className="text-xs text-slate-500">Current month</p>

              <ul className="mt-3 space-y-2">
                {byCategory.slice(0, 6).map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[c.name] || "#94a3b8" }}
                      />
                      <span className="text-sm font-medium text-slate-900">{c.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatMoney(c.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
