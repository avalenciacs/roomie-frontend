// src/pages/FlatsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, CardHeader, Button } from "../components/ui/ui";

function FlatsList() {
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        // Desktop CTA (solo escritorio)
        <Link to="/flats/create" className="hidden sm:block">
          <Button className="w-auto">+ Create flat</Button>
        </Link>
      }
    >
      {/* Mobile CTA (solo móvil) */}
      <div className="sm:hidden mb-4">
        <Link to="/flats/create">
          <Button className="w-full">+ Create flat</Button>
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
                    <span className="text-xs text-slate-500">Manage</span>
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
