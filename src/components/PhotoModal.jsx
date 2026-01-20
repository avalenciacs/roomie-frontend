// frontend/src/components/PhotoModal.jsx
import { useEffect } from "react";
import { Button } from "./ui/ui";

export default function PhotoModal({ open, onClose, title = "Photo", imageUrl }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {title}
              </p>
              <p className="truncate text-xs text-slate-500">Attached image</p>
            </div>
            <Button variant="outline" className="px-3 py-2" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="bg-slate-50 p-3">
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
