import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">
          This page doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
        >
          Go to My Flats
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
