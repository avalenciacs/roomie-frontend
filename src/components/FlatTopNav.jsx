import { Link, useLocation } from "react-router-dom";

export default function FlatTopNav({ flatId, title, subtitle, backTo = "/" }) {
  const { pathname } = useLocation();

  const isFlat = pathname === `/flats/${flatId}`;
  const isDashboard = pathname.includes(`/flats/${flatId}/dashboard`);
  const isBalance = pathname.includes(`/flats/${flatId}/balance`);

  const tabBase =
    "flex-1 text-center px-4 py-2 text-sm font-medium rounded-full transition";
  const tabActive = "bg-slate-900 text-white";
  const tabIdle = "text-slate-700 hover:bg-slate-100";

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 space-y-3">
        {/* Header row: back on the far-left, title perfectly centered */}
        {title ? (
          <div className="relative">
            {/* Back button (left aligned, bigger) */}
            <Link
              to={backTo}
              aria-label="Back to My Flats"
              className="absolute left-0 top-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full hover:bg-slate-100 transition"
              title="Back"
            >
              <img
                src="/back.svg"
                alt="Back"
                className="h-8 w-8"
                draggable="false"
              />
            </Link>

            {/* Centered title/subtitle */}
            <div className="text-center">
              <h1 className="text-base font-semibold text-slate-900">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="rounded-full border border-slate-200 bg-slate-50 p-1 flex items-center gap-1">
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
