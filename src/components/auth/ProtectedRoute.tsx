import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Role } from "../../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[]; // omit to allow any authenticated role
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { status, profile } = useAuth();

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="animate-pulse font-mono text-sm text-navy/60">Memuat sesi…</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !profile) {
    return <Navigate to="/masuk" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dasbor" replace />;
  }

  return <>{children}</>;
}
