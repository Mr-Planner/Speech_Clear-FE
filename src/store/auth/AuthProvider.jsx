import { useState } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, userName, setUserName }}
    >
      {children}
    </AuthContext.Provider>
  );
}
