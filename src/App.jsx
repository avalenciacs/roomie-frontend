import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FlatsList from "./pages/FlatsList";
import CreateFlat from "./pages/CreateFlat";
import FlatDetails from "./pages/FlatDetails";
import FlatBalance from "./pages/FlatBalance";
import IsPrivate from "./components/IsPrivate";
import Header from "./components/Header";

function App() {
  const location = useLocation();

  return (
    <>
      <Header />

      <Routes location={location}>
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
              <FlatBalance />
            </IsPrivate>
          }
        />
      </Routes>
    </>
  );
}

export default App;
