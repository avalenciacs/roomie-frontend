import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/auth.context";
import ResponsiveLayout from "../components/ResponsiveLayout";
import { Card, CardBody, CardHeader, Button } from "../components/ui/ui";

function FlatsList() {
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useContext(AuthContext);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="My Flats"
      subtitle="Choose a flat to manage tasks and expenses"
      right={
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-slate-600">
          {flats.length} {flats.length === 1 ? "flat" : "flats"}
        </p>

        <Link to="/flats/create">
          <Button>+ Create Flat</Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {flats.map((flat) => (
            <Link key={flat._id} to={`/flats/${flat._id}`} className="block">
              <Card className="hover:shadow-md transition">
                <CardHeader title={flat.name} subtitle={flat.description || "No description"} />
                <CardBody>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Open</span>
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
