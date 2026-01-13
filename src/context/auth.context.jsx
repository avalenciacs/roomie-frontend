import { createContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const storeToken = (token) => {
    localStorage.setItem("authToken", token);
  };

  const authenticateUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsLoading(false);
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await api.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      localStorage.removeItem("authToken");
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        storeToken,
        authenticateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
