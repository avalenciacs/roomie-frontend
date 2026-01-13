import { createContext } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
