import { useMemo } from "react";

export default function FilePicker({
  label = "Photo (optional)",
  helper = "Max 5MB. JPG/PNG/WebP.",
  accept = "image/*",
  value,
  onChange,
}) {
  const fileName = useMemo(() => value?.name || "No file selected", [value]);

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>

      {/* Hidden native input */}
      <input
        id="filepicker-input"
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange?.(e.target.files?.[0] || null)}
      />

      {/* Custom control (English) */}
      <div className="mt-1 flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
        <label
          htmlFor="filepicker-input"
          className="shrink-0 cursor-pointer rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100"
        >
          Choose file
        </label>

        <span className="min-w-0 truncate text-sm text-slate-700">
          {fileName}
        </span>

        {value ? (
          <button
            type="button"
            onClick={() => onChange?.(null)}
            className="ml-auto shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Clear
          </button>
        ) : null}
      </div>

      {helper ? (
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}
