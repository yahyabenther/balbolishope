// NewArrivals.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { Zap } from "lucide-react";

export default function NewArrivals() {
  const { products, loading } = useProducts();
  const items = products.filter((p) => p.tags?.newArrival);

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <span className="current">Nouveautés</span>
      </div>
      <div className="listing-header">
        <h2 className="listing-header__title">
          <Zap size={22} /> Nouveautés
        </h2>
        <span className="listing-header__count">Affichage de {items.length} résultats</span>
      </div>
      <div className="product-grid">
        {loading ? (
          <p>Chargement...</p>
        ) : items.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          items.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}