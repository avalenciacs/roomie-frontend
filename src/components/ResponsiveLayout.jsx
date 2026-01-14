import { Link } from "react-router-dom";

export default function ResponsiveLayout({ title, subtitle, backTo, right, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {backTo ? (
                <Link
                  to={backTo}
                  className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  ← Back
                </Link>
              ) : null}

              <div className="min-w-0">
                <h1 className="truncate text-base sm:text-lg font-semibold text-slate-900">
                  {title || "Roomie"}
                </h1>
                {subtitle ? (
                  <p className="truncate text-xs text-slate-500">{subtitle}</p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0">{right}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-5">
        {children}
      </main>
    </div>
  );
}
