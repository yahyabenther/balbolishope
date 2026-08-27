import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Gatekeeper for the whole /admin/* path. Only logged-in admins,
// super_admins, or moderators get through; everyone else is redirected
// to /account. (Moderator-specific page restrictions, like blocking
// Dashboard/Clients/Settings, are handled one level down by
// AdminOnlyRoute — this component only checks "is this an admin panel
// user at all".)
export default function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}