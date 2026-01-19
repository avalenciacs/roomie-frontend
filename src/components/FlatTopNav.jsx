
import { Link, useLocation } from "react-router-dom";

export default function FlatTopNav({ flatId }) {
  const location = useLocation();
  const path = location.pathname;

  const isDashboard = path.includes(`/flats/${flatId}/dashboard`);
  const isBalance = path.includes(`/flats/${flatId}/balance`);
  const isFlat = !isDashboard && !isBalance && path.startsWith(`/flats/${flatId}`);

  const tabClass = (active) =>
    `px-3 py-2 text-center text-sm font-medium ${
      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="py-3">
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <Link to={`/flats/${flatId}`} className={tabClass(isFlat)}>
              Flat
            </Link>

            <Link
              to={`/flats/${flatId}/dashboard`}
              className={tabClass(isDashboard)}
            >
              Dashboard
            </Link>

            <Link
              to={`/flats/${flatId}/balance`}
              className={tabClass(isBalance)}
            >
              Balance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
