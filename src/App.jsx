import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FlatsList from "./pages/FlatsList";
import CreateFlat from "./pages/CreateFlat";
import FlatDetails from "./pages/FlatDetails";
import IsPrivate from "./components/IsPrivate";
import Balance from "./pages/Balance";
import FlatBalance from "./pages/FlatBalance";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
            <Balance />
          </IsPrivate>
        }
      />

      <Route path="/flats/:flatId/balance" element={<FlatBalance />} />

    </Routes>
  );
}

export default App;
