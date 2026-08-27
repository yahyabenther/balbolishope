import React from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import CategoryImageSlider from "../components/CategoryImageSlider";
import { categories } from "../data/SampleProducts";
import { useProducts } from "../context/ProductContext";

// Pulls preview images for a category tile straight from live Firestore
// products. AdminProducts.jsx stores each product's category as the
// category ID (e.g. "chargers"), and its photo as an `images` array —
// so we match on id and read images[0], not name/image/imageUrl.
function getImagesForCategory(products, categoryId) {
  return products
    .filter((p) => p.category === categoryId)
    .map((p) => p.images?.[0])
    .filter(Boolean)
    .slice(0, 6);
}

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { products, loading } = useProducts();
  const category = categories.find((c) => c.id === categoryId);

  // AdminProducts.jsx stores category as the category ID, not the
  // display name — so filter by id, matching how it's actually saved.
  const items = products.filter((p) => p.category === category?.id);

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span className="current">{category?.name || categoryId}</span>
      </div>

      <div className="category-grid">
        {categories.map((c) => (
          <Link key={c.id} to={`/category/${c.id}`} className="category-pill">
            <CategoryImageSlider
              images={getImagesForCategory(products, c.id)}
              alt={c.name}
            />
            <div>{c.name}</div>
          </Link>
        ))}
      </div>

      <div className="listing-header">
        <h2>⚡ {category?.name || "Products"}</h2>
        <span className="listing-header__count">Showing {items.length} results</span>
      </div>

      <div className="product-grid">
        {loading ? (
          <p>Chargement...</p>
        ) : items.length === 0 ? (
          <p>No products in this category yet.</p>
        ) : (
          items.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}