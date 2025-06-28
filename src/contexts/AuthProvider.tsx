import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "./auth-context";
import type { User, DecodedToken } from "../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

// Component Provider
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(accessToken);
        // Kiểm tra hạn token (exp là giây, Date.now() là ms)
        if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
          setUser({
            accountId: decodedToken.accountId,
            roleId: decodedToken.roleId,
            roleName: decodedToken.roleName,
            email: decodedToken.sub,
          });
          setIsAuthenticated(true);
        } else {
          // Token hết hạn
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      setUser({
        accountId: decodedToken.accountId,
        roleId: decodedToken.roleId,
        roleName: decodedToken.roleName,
        email: decodedToken.sub,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
