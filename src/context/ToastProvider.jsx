import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./toast.context";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ title = "", message = "", tone = "info", duration = 3500 }) => {
      const id =
        globalThis.crypto?.randomUUID?.() || String(Date.now() + Math.random());

      const toast = { id, title, message, tone };
      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => remove(id), duration);
      return id;
    },
    [remove],
  );

  const api = useMemo(
    () => ({
      show,
      success: (message, opts = {}) =>
        show({ ...opts, tone: "success", message }),
      error: (message, opts = {}) => show({ ...opts, tone: "error", message }),
      info: (message, opts = {}) => show({ ...opts, tone: "info", message }),
      remove,
    }),
    [show, remove],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onClose }) {
  const toneStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    info: "border-slate-200 bg-white text-slate-900",
  };

  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-2xl border px-4 py-3 shadow-lg",
            toneStyles[t.tone] || toneStyles.info,
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {t.title ? (
                <p className="text-sm font-semibold leading-5">{t.title}</p>
              ) : null}
              <p className="text-sm leading-5 opacity-90">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onClose(t.id)}
              className="rounded-lg px-2 py-1 text-sm font-semibold opacity-80 hover:opacity-100"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
