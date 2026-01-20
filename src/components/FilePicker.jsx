import { useRef } from "react";

export default function FilePicker({
  file,
  onChange,
  label = "Photo (optional)",
  help = "Max 5MB. JPG/PNG/WebP.",
}) {
  const inputRef = useRef(null);

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div className="mt-1 flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Choose file
        </button>

        <span className="min-w-0 truncate text-sm text-slate-600">
          {file ? file.name : "No file selected"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />

      {help ? <p className="mt-1 text-xs text-slate-500">{help}</p> : null}
    </div>
  );
}
