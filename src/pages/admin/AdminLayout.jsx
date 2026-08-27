import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./admin.css";

export default function AdminLayout() {
  const { user, logout, isModerator } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/account");
  };

  const closeMenu = () => setMenuOpen(false);

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
      {/* Mobile-only top bar with hamburger toggle */}
      <div className="admin-mobile-topbar">
        <button
          className="admin-mobile-topbar__menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <span className="admin-mobile-topbar__title">{roleLabel}</span>
        <div className="admin-profile__avatar admin-profile__avatar--sm">{initials || "A"}</div>
      </div>

      {/* Backdrop shown behind the drawer on mobile when open */}
      {isMenuOpen && <div className="admin-sidebar-backdrop" onClick={closeMenu} />}

      <aside className={`admin-sidebar ${isMenuOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-profile">
            <div className="admin-profile__avatar">{initials || "A"}</div>
            <div>
              <div className="admin-profile__name">{displayName}</div>
              <div className="admin-profile__role">{roleLabel}</div>
            </div>
          </div>
          <button className="admin-sidebar__close-btn" onClick={closeMenu} aria-label="Fermer le menu">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {/* Dashboard, Clients, and Paramètres are admin-only — moderators
              only get Produits and Commandes. */}
          {!isModerator && (
            <NavLink to="/admin" end className="admin-link" onClick={closeMenu}>
              <LayoutDashboard size={17} /> Dashboard
            </NavLink>
          )}
          <NavLink to="/admin/products" className="admin-link" onClick={closeMenu}>
            <Package size={17} /> Produits
          </NavLink>
          <NavLink to="/admin/orders" className="admin-link" onClick={closeMenu}>
            <ShoppingBag size={17} /> Commandes
          </NavLink>
          {!isModerator && (
            <NavLink to="/admin/clients" className="admin-link" onClick={closeMenu}>
              <Users size={17} /> Clients
            </NavLink>
          )}
          {!isModerator && (
            <NavLink to="/admin/settings" className="admin-link" onClick={closeMenu}>
              <Settings size={17} /> Paramètres
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-link" onClick={closeMenu}>
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