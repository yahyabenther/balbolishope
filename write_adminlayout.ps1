$content = @'
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./admin.css";

export default function AdminLayout() {
  const { user, logout, isModerator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/account");
  };

  const displayName = user?.name || user?.email || "Admin";
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const roleLabel = isModerator ? "Modérateur" : "Administrateur";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-profile">
          <div className="admin-profile__avatar">{initials || "A"}</div>
          <div>
            <div className="admin-profile__name">{displayName}</div>
            <div className="admin-profile__role">{roleLabel}</div>
          </div>
        </div>

        <nav className="admin-nav">
          {/* Dashboard, Clients, and Paramètres are admin-only — moderators
              only get Produits and Commandes. */}
          {!isModerator && (
            <NavLink to="/admin" end className="admin-link">
              <LayoutDashboard size={17} /> Dashboard
            </NavLink>
          )}
          <NavLink to="/admin/products" className="admin-link">
            <Package size={17} /> Produits
          </NavLink>
          <NavLink to="/admin/orders" className="admin-link">
            <ShoppingBag size={17} /> Commandes
          </NavLink>
          {!isModerator && (
            <NavLink to="/admin/clients" className="admin-link">
              <Users size={17} /> Clients
            </NavLink>
          )}
          {!isModerator && (
            <NavLink to="/admin/settings" className="admin-link">
              <Settings size={17} /> Paramètres
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-link">
            <ArrowLeft size={17} /> Retour à la boutique
          </NavLink>
          <button className="admin-link admin-logout-btn" onClick={handleLogout}>
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

'@
Set-Content -Path "src\\pages\\admin\\AdminLayout.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."