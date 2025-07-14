import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<number | string>; // Accept roleId (number) or roleName (string)
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && allowedRoles && allowedRoles.length > 0) {
    // Support both roleId (number) and roleName (string)
    const hasRole = allowedRoles.some(
      (role) =>
        (typeof role === "number" && user.roleId === role) ||
        (typeof role === "string" && user.roleName === role)
    );
    if (!hasRole) {
      // Redirect based on role if authenticated but not authorized
      if (user.roleName === "ROLE_ADMIN") {
        return <Navigate to="/admin" replace />;
      } else if (user.roleName === "ROLE_CONSULTANT") {
        return <Navigate to="/consultant" replace />;
      } else {
        // Default user
        return <Navigate to="/home" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
