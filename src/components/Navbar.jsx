import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { categories } from "../data/SampleProducts";
import { Home, Zap, Percent, TrendingUp, Star, Menu, MapPin } from "lucide-react";

const links = [
  { to: "/", label: "Accueil", icon: <Home size={16} />, end: true },
  { to: "/new-arrivals", label: "Nouveautés", icon: <Zap size={16} /> },
  { to: "/promotions", label: "Promotions", icon: <Percent size={16} /> },
  { to: "/best-sellers", label: "Meilleures Ventes", icon: <TrendingUp size={16} /> },
  { to: "/featured", label: "En Vedette", icon: <Star size={16} /> },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <nav className="site-nav">
      <div className="container site-nav__row">
        <div className="site-nav__menu">
          <button
            className="site-nav__menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          >
            <Menu size={16} /> Menu
          </button>
          {menuOpen && (
            <div className="site-nav__dropdown">
              {categories.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/category/${c.id}`}
        className="site-nav__dropdown-item"
        onClick={() => setMenuOpen(false)}
      >
        <c.icon size={16} /> {c.name}
      </NavLink>
    ))}
  </div>
)}
        </div>

        <button
          className="site-nav__mobile-toggle"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Basculer la navigation"
        >
          <Menu size={20} />
        </button>

        <ul className={`site-nav__links ${mobileNavOpen ? "site-nav__links--open" : ""}`}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className="site-nav__link" onClick={() => setMobileNavOpen(false)}>
                {l.icon} {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="site-nav__pickup">
          <MapPin size={16} /> Retrait Local
        </div>
      </div>
    </nav>
  );
}