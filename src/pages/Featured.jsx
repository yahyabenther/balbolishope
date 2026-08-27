// Featured.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { Star } from "lucide-react";

export default function Featured() {
  const { products, loading } = useProducts();
  const items = products.filter((p) => p.tags?.featured);

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <span className="current">En Vedette</span>
      </div>
      <div className="listing-header">
        <h2 className="listing-header__title">
          <Star size={22} /> En Vedette
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