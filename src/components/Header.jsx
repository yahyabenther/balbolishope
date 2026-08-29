import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { categories } from "../data/SampleProducts";
import { Search, User, ShoppingCart, LayoutDashboard, LogOut } from "lucide-react";
import logo from "../assets/logo.png";
import CategorySelect from "./CategorySelect";

export default function Header() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const { itemCount, subtotal, setCartOpen } = useCart();
  const { isLoggedIn, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <Link to="/" className="site-header__logo">
          <div className="logo-badge">
            <img src={logo} alt="Balbali Store" className="logo-img" />
          </div>
        </Link>

        <form className="site-header__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Rechercher des produits"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <CategorySelect categories={categories} value={category} onChange={setCategory} />
          <button type="submit" className="site-header__search-btn" aria-label="Rechercher">
            <Search size={18} />
          </button>
        </form>

        <div className="site-header__actions">
          {isLoggedIn ? (
            <div className="site-header__account-menu">
              <Link to="/account" className="site-header__account">
                <User size={18} /> <span>Bonjour, {user.firstName}</span>
              </Link>
              <button className="site-header__logout" onClick={logout} aria-label="Déconnexion">
                <LogOut size={18} /> <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <Link to="/account" className="site-header__account">
              <User size={18} /> <span>Connexion / Inscription</span>
            </Link>
          )}

          <button className="site-header__cart" onClick={() => setCartOpen(true)}>
            <ShoppingCart size={18} /> <span>{subtotal.toFixed(2)} TND</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          {isAdmin && (
            <Link to="/admin" className="site-header__admin-btn" aria-label="Tableau de bord Admin">
              <LayoutDashboard size={18} /> <span>Tableau de bord Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}