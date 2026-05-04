import { Navigate } from "react-router-dom";
import { useZentivo } from "@/lib/zentivo-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useZentivo();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
