
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function CreateFlat() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (isSubmitting) return;

    // basic client validation
    if (!name.trim()) {
      setErrorMessage("Please enter a flat name.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");

      await api.post(
        "/api/flats",
        { name: name.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      navigate("/");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Error creating flat. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-10 md:pt-10 md:pb-16">
        {/* Header row */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Create a flat
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Give it a name and (optionally) a short description.
            </p>
          </div>

          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            {errorMessage && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Flat name <span className="text-red-500">*</span>
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="e.g. Palma Loft"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  This will be visible to all roommates.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description (optional)
                </label>
                <textarea
                  className="mt-1 min-h-[110px] w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="Anything useful: address notes, house rules, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={220}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Keep it short and helpful.</span>
                  <span>{description.length}/220</span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create flat"}
                </button>
              </div>
            </form>
          </div>

          {/* Subtle footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-500 md:px-8">
            Tip: After creating a flat, you can invite roommates from the flat
            details page.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateFlat;
