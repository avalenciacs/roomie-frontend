
import { Routes, Route } from "react-router-dom";
import IsPrivate from "./components/IsPrivate";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FlatsList from "./pages/FlatsList";
import FlatDetails from "./pages/FlatDetails";
import FlatBalance from "./pages/FlatBalance";
import FlatDashboard from "./pages/FlatDashboard"; 

function App() {
  return (
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
            <FlatDashboard />
          </IsPrivate>
        }
      />
    </Routes>
  );
}

export default App;
