import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allow?: Array<"ADMIN" | "TEACHER" | "STUDENT">;
}> = ({ children, allow }) => {
  const { loading, user } = useAuth();

  if (loading) return null; // hoặc spinner

  if (!user) return <Navigate to="/login" replace />;

  if (allow && allow.length > 0 && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
