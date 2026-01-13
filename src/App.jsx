import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import IsPrivate from "./components/IsPrivate";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <IsPrivate>
            <Dashboard />
          </IsPrivate>
        }
      />
    </Routes>
  );
}

export default App;