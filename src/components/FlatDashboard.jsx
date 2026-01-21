
import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Pill } from "./ui/ui";
import {
  categoryLabel,
  categoryColor,
  normalizeCategory,
} from "../constants/categories";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const formatMoney = (n) => `${Number(n || 0).toFixed(2)} €`;

function toDateOrNull(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function monthRange(offset = 0) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start: startOfDay(first), end: endOfDay(last), labelDate: first };
}

function fmtMonthYear(d) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

function filterByRange(expenses, start, end) {
  return expenses.filter((e) => {
    const d = toDateOrNull(e?.date);
    if (!d) return false;
    return d >= start && d <= end;
  });
}

function DonutTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const value = Number(p?.value || 0);
  const name = p?.name || "Category";
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="text-sm text-slate-700">{formatMoney(value)}</p>
      <p className="text-xs text-slate-500">{percent.toFixed(0)}%</p>
    </div>
  );
}

export default function FlatDashboard({ expenses = [] }) {
  // period selector
  const [period, setPeriod] = useState("this"); // this | last | custom
  const [customFrom, setCustomFrom] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [customTo, setCustomTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const { rangeStart, rangeEnd, rangeLabel, periodSubtitle } = useMemo(() => {
    if (period === "last") {
      const r = monthRange(-1);
      return {
        rangeStart: r.start,
        rangeEnd: r.end,
        rangeLabel: fmtMonthYear(r.labelDate),
        periodSubtitle: "Last month",
      };
    }

    if (period === "custom") {
      const from = toDateOrNull(customFrom) || new Date();
      const to = toDateOrNull(customTo) || from;

      const start = startOfDay(from);
      const end = endOfDay(to >= from ? to : from);

      const label = `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`;
      return {
        rangeStart: start,
        rangeEnd: end,
        rangeLabel: label,
        periodSubtitle: "Custom range",
      };
    }

    // default: this month
    const r = monthRange(0);
    return {
      rangeStart: r.start,
      rangeEnd: r.end,
      rangeLabel: fmtMonthYear(r.labelDate),
      periodSubtitle: "This month",
    };
  }, [period, customFrom, customTo]);

  const { total, byCategory } = useMemo(() => {
    const filtered = filterByRange(expenses, rangeStart, rangeEnd);

    const t = filtered.reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const map = new Map();
    for (const e of filtered) {
      const key = normalizeCategory(e.category);
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    }

    const arr = Array.from(map.entries())
      .map(([key, value]) => ({
        key,
        name: categoryLabel(key),
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return { total: t, byCategory: arr };
  }, [expenses, rangeStart, rangeEnd]);

  const hasData = byCategory.length > 0;

  return (
    <Card>
      <CardHeader
        title="Dashboard"
        subtitle="Period overview"
        right={<Pill tone="neutral">{formatMoney(total)}</Pill>}
      />

      <CardBody>
        {/* Period selector */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{rangeLabel}</p>
            <p className="text-xs text-slate-500">{periodSubtitle}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-xs font-medium text-slate-600">
              Period
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:w-44"
              >
                <option value="this">This month</option>
                <option value="last">Last month</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            {period === "custom" ? (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600">
                  From
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </label>
                <label className="text-xs font-medium text-slate-600">
                  To
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>

        {!hasData ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">No data yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Add expenses with categories to see charts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Donut */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                Expenses by category
              </p>
              <p className="text-xs text-slate-500">{rangeLabel}</p>

              <div className="mt-3 w-full h-56 min-h-[224px]">
                <ResponsiveContainer
                  key={rangeLabel}
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Tooltip content={<DonutTooltip total={total} />} />
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
                        <Cell key={entry.key} fill={categoryColor(entry.key)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top categories */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                Top categories
              </p>
              <p className="text-xs text-slate-500">{rangeLabel}</p>

              <ul className="mt-3 space-y-2">
                {byCategory.slice(0, 6).map((c) => (
                  <li
                    key={c.key}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoryColor(c.key) }}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {c.name}
                      </span>
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
