// src/pages/FlatBalance.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, CardHeader, Pill, Button } from "../components/ui/ui";
import FlatTopNav from "../components/FlatTopNav";

function FlatBalance() {
  const { flatId } = useParams();
  const token = localStorage.getItem("authToken");
  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // UI toggles (to reduce cognitive load)
  const [showDetails, setShowDetails] = useState(false); // toggles "You owe/receive" lists
  const [showPerPerson, setShowPerPerson] = useState(false); // collapses per-person by default

  const myEmail = useMemo(() => user?.email || null, [user]);

  const formatMoney = (n) => `${Number(n || 0).toFixed(2)} €`;

  const formatSigned = (n) => {
    const num = Number(n || 0);
    const sign = num > 0 ? "+" : num < 0 ? "−" : "";
    return `${sign}${Math.abs(num).toFixed(2)} €`;
  };

  const nameByEmail = useMemo(() => {
    const map = {};
    if (!flat?.members) return map;
    for (const m of flat.members) {
      if (m?.email) map[m.email] = m.name || m.email;
    }
    return map;
  }, [flat]);

  const label = (email) => (email ? nameByEmail[email] || email : "Unknown");
  const secondaryEmail = (email) => (email && nameByEmail[email] ? email : "");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setPageError("");

      try {
        const [balanceRes, flatRes] = await Promise.all([
          api.get(`/api/flats/${flatId}/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/api/flats/${flatId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!alive) return;
        setData(balanceRes.data);
        setFlat(flatRes.data);
      } catch (e) {
        if (!alive) return;
        setPageError(e?.response?.data?.message || "Error loading balance");
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 w-40 mx-auto rounded-xl bg-slate-200/60 animate-pulse md:col-span-2" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-56 animate-pulse rounded-2xl bg-slate-200/60 md:col-span-2" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!data) {
    return (
      <ResponsiveLayout top={<FlatTopNav flatId={flatId} />} hideHeader>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">
              Balance not available
            </p>
            {pageError ? (
              <p className="mt-1 text-sm text-slate-600">{pageError}</p>
            ) : null}
            <div className="mt-4">
              <Link to="/flats">
                <Button>Back to My Flats</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  const totals = Array.isArray(data.totals) ? data.totals : [];
  const settlements = Array.isArray(data.settlements) ? data.settlements : [];

  const youOwe = myEmail ? settlements.filter((s) => s?.from === myEmail) : [];
  const youReceive = myEmail ? settlements.filter((s) => s?.to === myEmail) : [];

  const sum = (arr) => arr.reduce((acc, x) => acc + Number(x?.amount || 0), 0);
  const oweTotal = sum(youOwe);
  const receiveTotal = sum(youReceive);

  const hasAny = totals.length > 0 || settlements.length > 0;

  return (
    <ResponsiveLayout
      top={
        <FlatTopNav
          flatId={flatId}
          title={flat?.name || "Flat"}
          subtitle={flat?.description || "Shared flat workspace"}
        />
      }
      hideHeader
    >
      {pageError ? (
        <Card className="mt-4">
          <CardBody>
            <p className="text-sm font-semibold text-slate-900">Heads up</p>
            <p className="mt-1 text-sm text-slate-600">{pageError}</p>
          </CardBody>
        </Card>
      ) : null}

      {/* Quick actions row */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          className="px-3 py-2"
          onClick={() => setShowDetails((v) => !v)}
          disabled={!hasAny}
        >
          {showDetails ? "Hide details" : "Show details"}
        </Button>

        <Button
          variant="outline"
          className="px-3 py-2"
          onClick={() => setShowPerPerson((v) => !v)}
          disabled={totals.length === 0}
        >
          {showPerPerson ? "Hide per person" : "View per person"}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* YOU OWE (summary first, details optional) */}
        <Card>
          <CardHeader
            title="You owe"
            subtitle={youOwe.length ? "What you should pay" : "You're all good"}
            right={
              <Pill tone={youOwe.length ? "neg" : "neutral"}>
                {youOwe.length ? formatMoney(oweTotal) : "OK"}
              </Pill>
            }
          />
          <CardBody>
            {!myEmail ? (
              <p className="text-sm text-slate-600">
                Login again to see your personal summary.
              </p>
            ) : youOwe.length === 0 ? (
              <p className="text-sm text-slate-700">Nothing 🎉</p>
            ) : showDetails ? (
              <ul className="space-y-2">
                {youOwe.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-semibold text-slate-900"
                        title={s?.to}
                      >
                        {label(s?.to)}
                      </p>
                      {secondaryEmail(s?.to) ? (
                        <p className="truncate text-xs text-slate-500">
                          {secondaryEmail(s?.to)}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm font-semibold text-rose-700">
                      {formatMoney(s?.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700">
                {youOwe.length} {youOwe.length === 1 ? "payment" : "payments"} pending.
              </p>
            )}
          </CardBody>
        </Card>

        {/* YOU RECEIVE */}
        <Card>
          <CardHeader
            title="You receive"
            subtitle={youReceive.length ? "What you should get" : "No incoming payments"}
            right={
              <Pill tone={youReceive.length ? "pos" : "neutral"}>
                {youReceive.length ? formatMoney(receiveTotal) : "OK"}
              </Pill>
            }
          />
          <CardBody>
            {!myEmail ? (
              <p className="text-sm text-slate-600">
                Login again to see your personal summary.
              </p>
            ) : youReceive.length === 0 ? (
              <p className="text-sm text-slate-700">Nothing</p>
            ) : showDetails ? (
              <ul className="space-y-2">
                {youReceive.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-semibold text-slate-900"
                        title={s?.from}
                      >
                        {label(s?.from)}
                      </p>
                      {secondaryEmail(s?.from) ? (
                        <p className="truncate text-xs text-slate-500">
                          {secondaryEmail(s?.from)}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">
                      {formatMoney(s?.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-700">
                {youReceive.length} {youReceive.length === 1 ? "incoming payment" : "incoming payments"}.
              </p>
            )}
          </CardBody>
        </Card>

        {/* PER PERSON (collapsible by default) */}
        {showPerPerson ? (
          <Card className="md:col-span-2">
            <CardHeader
              title="Balance per person"
              subtitle="Green receives · Red owes"
              right={
                <Button
                  variant="ghost"
                  className="px-3 py-2"
                  onClick={() => setShowPerPerson(false)}
                >
                  Hide
                </Button>
              }
            />
            <CardBody>
              {totals.length === 0 ? (
                <p className="text-sm text-slate-700">No data yet</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {totals.map((t, idx) => {
                    const net = Number(t?.net || 0);
                    const tone = net > 0 ? "pos" : net < 0 ? "neg" : "neutral";
                    return (
                      <div
                        key={t?.userId || idx}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                        title={t?.email}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {label(t?.email)}
                            </p>
                            {secondaryEmail(t?.email) ? (
                              <p className="truncate text-xs text-slate-500">
                                {secondaryEmail(t?.email)}
                              </p>
                            ) : null}
                          </div>
                          <Pill tone={tone}>{formatSigned(net)}</Pill>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        ) : null}

        {/* SETTLEMENTS (make it more explicit + clearer language) */}
        <Card className="md:col-span-2">
          <CardHeader
            title="Suggested payments"
            subtitle="To settle up, these transfers are needed"
          />
          <CardBody>
            {settlements.length === 0 ? (
              <p className="text-sm text-slate-700">All settled ✅</p>
            ) : (
              <ul className="space-y-2">
                {settlements.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                  >
                    <p className="text-sm text-slate-900">
                      <span className="font-semibold" title={s?.from}>
                        {label(s?.from)}
                      </span>{" "}
                      <span className="text-slate-500">pays</span>{" "}
                      <span className="font-semibold" title={s?.to}>
                        {label(s?.to)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatMoney(s?.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Tip: these are suggested transfers. You can pay in any way as long as totals match.
            </p>
          </CardBody>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}

export default FlatBalance;
