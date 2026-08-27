import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps admin-only pages (Dashboard, Clients, Paramètres). Moderators are
// already confirmed admins by AdminRoute, but shouldn't reach these
// specific pages — redirect them to Commandes instead.
export default function AdminOnlyRoute({ children }) {
  const { isModerator } = useAuth();

  if (isModerator) {
    return <Navigate to="/admin/orders" replace />;
  }

  return children;
}