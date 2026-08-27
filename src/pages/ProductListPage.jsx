import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";

export default function ProductListPage({ title, icon, tagKey }) {
  const { products, loading } = useProducts();
  const items = products.filter((p) => p.tags?.[tagKey]);

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <span className="current">{title}</span>
      </div>

      <div className="listing-header">
        <h2>
          {icon} {title}
        </h2>
        <span className="listing-header__count">Affichage de {items.length} résultats</span>
      </div>

      <div className="product-grid">
        {loading ? (
          <p>Chargement...</p>
        ) : items.length === 0 ? (
          <p>Aucun produit ici pour le moment.</p>
        ) : (
          items.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}