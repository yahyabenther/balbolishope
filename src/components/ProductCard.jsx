import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// A product image entry is either a hex color string ("#c0392b") used as a
// placeholder, or an imported photo (resolves to a URL string). This
// distinguishes the two so both render correctly.
function isHexColor(value) {
  return typeof value === "string" && value.startsWith("#");
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const firstImage = product.images?.[0];

  // Backward-compatible: older products may still have a numeric "stock"
  // field instead of the boolean "inStock" flag added later. Without this
  // fallback, any product missing "inStock" reads as falsy and shows
  // "Rupture de stock" even when it's actually available.
  const isInStock =
    typeof product.inStock === "boolean" ? product.inStock : (product.stock ?? 0) > 0;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock) {
      alert("Ce produit est en rupture de stock et ne peut pas être commandé pour le moment.");
      return;
    }
    addItem(product, 1);
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <div
          className="product-card__image"
          style={isHexColor(firstImage) ? { background: firstImage } : undefined}
        >
          {!isHexColor(firstImage) && firstImage && (
            <img src={firstImage} alt={product.name} />
          )}
          {product.discountPercent && (
            <span className="badge badge--discount">-{product.discountPercent}%</span>
          )}
          {product.badges?.includes("NEW") && <span className="badge badge--new">NOUVEAU</span>}
          {product.badges?.includes("HOT") && <span className="badge badge--hot">TENDANCE</span>}
        </div>
        <div className="product-card__body">
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__sku">sku: {product.sku}</div>
          <div className={`product-card__stock ${isInStock ? "in" : "out"}`}>
            ● {isInStock ? "En stock" : "Rupture de stock"}
          </div>
          <div className="product-card__price">
            {product.oldPrice && <span className="old-price">{product.oldPrice.toFixed(2)} TND</span>}
            <span className="price">{product.price.toFixed(2)} TND</span>
          </div>
        </div>
      </Link>
      <button
        className={`btn product-card__btn ${isInStock ? "btn-accent" : "btn-outline"}`}
        onClick={handleAddToCart}
      >
        {isInStock ? "Ajouter au Panier" : "Rupture de stock"}
      </button>
    </div>
  );
}