// src/components/FlatTopNav.jsx
import { Link, useLocation } from "react-router-dom";

export default function FlatTopNav({
  flatId,
  title,
  subtitle,
  backTo = "/",
}) {
  const { pathname } = useLocation();

  const isFlat = pathname === `/flats/${flatId}`;
  const isDashboard = pathname.includes(`/flats/${flatId}/dashboard`);
  const isBalance = pathname.includes(`/flats/${flatId}/balance`);

  const tabBase =
    "flex-1 text-center px-4 py-2 text-sm font-medium rounded-full transition";
  const tabActive = "bg-slate-900 text-white";
  const tabIdle = "text-slate-700 hover:bg-slate-100";

  // Back behaves like a tab but fixed width
  const backBase =
    "shrink-0 w-12 h-9 flex items-center justify-center rounded-full transition";
  const backIdle = "text-slate-700 hover:bg-slate-100";

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 space-y-3">
        {/* Title centered */}
        {title ? (
          <div className="text-center">
            <h1 className="text-base font-semibold text-slate-900">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        {/* One single bar: Back inside + Tabs */}
        <div className="rounded-full border border-slate-200 bg-slate-50 p-1 flex items-center gap-1">
          <Link
            to={backTo}
            aria-label="Back"
            className={`${backBase} ${backIdle}`}
            title="Back"
          >
            <span aria-hidden className="text-lg leading-none">
              ←
            </span>
          </Link>

          <Link
            to={`/flats/${flatId}`}
            className={`${tabBase} ${isFlat ? tabActive : tabIdle}`}
          >
            Flat
          </Link>

          <Link
            to={`/flats/${flatId}/dashboard`}
            className={`${tabBase} ${isDashboard ? tabActive : tabIdle}`}
          >
            Dashboard
          </Link>

          <Link
            to={`/flats/${flatId}/balance`}
            className={`${tabBase} ${isBalance ? tabActive : tabIdle}`}
          >
            Balance
          </Link>
        </div>
      </div>
    </div>
  );
}
