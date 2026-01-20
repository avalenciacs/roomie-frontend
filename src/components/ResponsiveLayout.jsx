
import { Link } from "react-router-dom";

export default function ResponsiveLayout({
  title,
  subtitle,
  backTo,
  right,
  top,
  hideHeader = false,
  centerTitle = false,
  children,
}) {
  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-1px)]">
      {top ? <div className="w-full">{top}</div> : null}

      <div className="mx-auto w-full max-w-3xl px-4 pb-10">
        {!hideHeader ? (
          <div className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  {backTo ? (
                    <Link
                      to={backTo}
                      aria-label="Back"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      <span aria-hidden className="text-lg leading-none">
                        ←
                      </span>
                    </Link>
                  ) : null}
                </div>

                {title ? (
                  <div className={centerTitle ? "mt-2 text-center" : "mt-2"}>
                    <h1 className="text-base font-semibold text-slate-900 truncate">
                      {title}
                    </h1>
                    {subtitle ? (
                      <p className="mt-0.5 text-sm text-slate-600">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {right ? <div className="shrink-0">{right}</div> : null}
            </div>
          </div>
        ) : null}

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
