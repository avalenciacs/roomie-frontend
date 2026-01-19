import { Routes, Route } from "react-router-dom";
import IsPrivate from "./components/IsPrivate";

import Header from "./components/Header";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FlatsList from "./pages/FlatsList";
import FlatDetails from "./pages/FlatDetails";
import FlatBalance from "./pages/FlatBalance";
import FlatDashboardPage from "./pages/FlatDashboardPage";
import CreateFlat from "./pages/CreateFlat";
import FlatEdit from "./pages/FlatEdit";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Logo centrado SIEMPRE */}
      <Header />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private */}
        <Route
          path="/"
          element={
            <IsPrivate>
              <FlatsList />
            </IsPrivate>
          }
        />

        <Route
          path="/flats/create"
          element={
            <IsPrivate>
              <CreateFlat />
            </IsPrivate>
          }
        />

        <Route
          path="/flats/:flatId"
          element={
            <IsPrivate>
              <FlatDetails />
            </IsPrivate>
          }
        />

        <Route
          path="/flats/:flatId/balance"
          element={
            <IsPrivate>
              <FlatBalance />
            </IsPrivate>
          }
        />

        <Route
          path="/flats/:flatId/dashboard"
          element={
            <IsPrivate>
              <FlatDashboardPage />
            </IsPrivate>
          }
        />


        <Route path="/flats/:flatId/edit" element={<FlatEdit />} />
      </Routes>
    </div>
  );
}

export default App;
