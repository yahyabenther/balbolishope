import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const { products, loading } = useProducts();

  const items = products.filter((p) => {
    const matchesQuery = !q || p.name?.toLowerCase().includes(q.toLowerCase());
    const matchesCategory = !category || p.category?.toLowerCase() === category.toLowerCase();
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <span className="current">Recherche</span>
      </div>

      {q && (
          <div className="listing-header">
            <h2>🔍 Résultats pour "{q}"</h2>
            <span className="listing-header__count">Affichage de {items.length} résultats</span>
          </div>
        )}

      <div className="product-grid">
          {loading ? (
            <p>Chargement...</p>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3>Aucun résultat trouvé</h3>
              <p>Aucun produit ne correspond à {q ? <>« <strong>{q}</strong> »</> : "votre recherche"}. Essayez avec d'autres mots-clés.</p>
              <Link to="/" className="empty-state__cta">Voir tous les produits</Link>
            </div>
          ) : (
            items.map((p) => <ProductCard key={p.id} product={p} />)
          )}
      </div>
    </div>
  );
}