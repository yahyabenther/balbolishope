import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/SampleProducts";
import { useProducts } from "../context/ProductContext";
import { Zap, Percent, TrendingUp, Star, ArrowRight } from "lucide-react";
import HeroSlider from "../components/HeroSlider";
import CategoryImageSlider from "../components/CategoryImageSlider";

// Pulls preview images for a category tile from live Firestore products,
// matching by category id (how AdminProducts.jsx actually saves it) and
// reading images[0] (the base64 photo array), not a single `image` field.
function getImagesForCategory(products, categoryId) {
  return products
    .filter((p) => p.category === categoryId)
    .map((p) => p.images?.[0])
    .filter(Boolean)
    .slice(0, 6);
}

function ProductSection({ title, icon, viewAllHref, items }) {
  if (items.length === 0) return null;
  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2 className="home-section__title">
          {icon} {title}
        </h2>
        <Link to={viewAllHref} className="home-section__view-all">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      <div className="product-grid">
        {items.slice(0, 5).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <div className="container">
      <HeroSlider />

      <section className="home-section">
        <h2>Catégories</h2>
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
      </section>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <ProductSection
            title="Nouveautés"
            icon={<Zap size={20} />}
            viewAllHref="/new-arrivals"
            items={products.filter((p) => p.tags?.newArrival)}
          />
          <ProductSection
            title="Promotions"
            icon={<Percent size={20} />}
            viewAllHref="/promotions"
            items={products.filter((p) => p.tags?.promotion)}
          />
          <ProductSection
            title="Meilleures Ventes"
            icon={<TrendingUp size={20} />}
            viewAllHref="/best-sellers"
            items={products.filter((p) => p.tags?.bestSeller)}
          />
          <ProductSection
            title="En Vedette"
            icon={<Star size={20} />}
            viewAllHref="/featured"
            items={products.filter((p) => p.tags?.featured)}
          />
        </>
      )}
    </div>
  );
}