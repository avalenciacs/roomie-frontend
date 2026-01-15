import { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, CardHeader, Button } from "../components/ui/ui";

function FlatsList() {
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  const flatsCountLabel = useMemo(() => {
    const n = flats.length;
    return `${n} ${n === 1 ? "flat" : "flats"}`;
  }, [flats.length]);

  const getFlats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get("/api/flats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlats(response.data);
    } catch (error) {
      console.error(error);
      alert("Error loading flats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFlats();
  }, []);

  if (isLoading) {
    return (
      <ResponsiveLayout title="My Flats" subtitle="Loading…">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="My Flats"
      subtitle="Choose a flat to manage tasks and expenses"
      right={
        <Button
          onClick={logout}
          className="border border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
        >
          Logout
        </Button>
      }
    >
      {/* Top actions row:
          - Removes the extra “Manage your shared places” text
          - “Create flat” becomes full-width on mobile and aligned right on desktop
      */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            {flatsCountLabel}
          </span>
        </div>

        <Link to="/flats/create" className="sm:ml-auto">
          <Button className="w-full sm:w-auto">+ Create flat</Button>
        </Link>
      </div>

      {flats.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-700">You have no flats yet.</p>
            <div className="mt-3">
              <Link to="/flats/create">
                <Button>Create your first flat</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {flats.map((flat) => (
            <Link key={flat._id} to={`/flats/${flat._id}`} className="block">
              <Card className="transition hover:shadow-md">
                <CardHeader
                  title={flat.name}
                  subtitle={flat.description || "No description"}
                />
                <CardBody>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-700">Open flat</span>
                    <span className="text-sm font-medium text-slate-900">→</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </ResponsiveLayout>
  );
}

export default FlatsList;


