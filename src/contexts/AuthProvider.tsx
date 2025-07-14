import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "./auth-context";
import type {
  User,
  DecodedToken,
  RegisterFormValues,
  RegisterResponse,
  AuthContextType,
} from "../types/auth";
import * as authApi from "../api/auth";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: set user from token
  const setUserFromToken = (accessToken: string) => {
    const decodedToken = jwtDecode<DecodedToken>(accessToken);
    setUser({
      accountId: decodedToken.accountId,
      roleId: decodedToken.roleId,
      roleName: decodedToken.roleName,
      email: decodedToken.sub,
    });
    setIsAuthenticated(true);
  };

  // On mount: check token
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(accessToken);
        if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
          setUser({
            accountId: decodedToken.accountId,
            roleId: decodedToken.roleId,
            roleName: decodedToken.roleName,
            email: decodedToken.sub,
          });
          setIsAuthenticated(true);
        } else {
          // Token expired, try refresh
          refresh();
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
    setUserFromToken(accessToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (
    data: RegisterFormValues
  ): Promise<RegisterResponse> => {
    // Ensure gender is MALE | FEMALE | OTHER or undefined
    const gender = (
      ["MALE", "FEMALE", "OTHER"].includes(data.gender)
        ? data.gender
        : undefined
    ) as "MALE" | "FEMALE" | "OTHER" | undefined;
    return await authApi.register({ ...data, gender });
  };

  const refresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return;
    }
    try {
      const res = await authApi.refreshToken(refreshToken);
      if (res.code === 1000 && res.result?.accessToken) {
        localStorage.setItem("accessToken", res.result.accessToken);
        localStorage.setItem("refreshToken", res.result.refreshToken);
        setUserFromToken(res.result.accessToken);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    refresh,
    loading,
  };

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
