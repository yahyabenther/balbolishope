$content = @'
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { Package, Store, Minus, Plus, Check } from "lucide-react";

function isHexColor(value) {
  return typeof value === "string" && value.startsWith("#");
}

export default function ProductDetail() {
  const { productId } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === productId);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  if (loading) {
    return (
      <div className="container">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <p>Produit non trouvé.</p>
      </div>
    );
  }

  // Backward-compatible: older products may still use the single
  // color/colorHex fields instead of a colors array.
  const colors = Array.isArray(product.colors)
    ? product.colors
    : product.color
    ? [{ name: product.color, hex: product.colorHex || "#000000" }]
    : [];

  const selectedColor = colors[selectedColorIndex] || null;

  function handleAddToCart() {
    addItem(product, qty, selectedColor);
  }

  function handleBuyNow() {
    addItem(product, qty, selectedColor);
    navigate("/checkout");
  }

  const images = product.images || [];
  const activeImg = images[activeImage];

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <Link to={`/category/${product.category}`}>{product.category}</Link> /{" "}
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-detail__gallery">
          <div
            className="product-detail__image"
            style={isHexColor(activeImg) ? { background: activeImg } : undefined}
          >
            {!isHexColor(activeImg) && activeImg && (
              <img src={activeImg} alt={product.name} />
            )}
          </div>
          <div className="product-detail__thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`product-detail__thumb ${activeImage === i ? "active" : ""}`}
                style={isHexColor(img) ? { background: img } : undefined}
                onClick={() => setActiveImage(i)}
                aria-label={`Voir l'image ${i + 1}`}
              >
                {!isHexColor(img) && img && (
                  <img src={img} alt={`${product.name} miniature ${i + 1}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail__info">
          <h1>{product.name}</h1>
          <p className="product-detail__description">{product.description}</p>

          <div className="product-detail__price">
            {product.oldPrice && <span className="old-price">{Number(product.oldPrice).toFixed(2)} TND</span>}
            <span className="price">{Number(product.price).toFixed(2)} TND</span>
          </div>

          {colors.length > 0 && (
            <div className="product-detail__colors" style={{ margin: "16px 0" }}>
              <div style={{ marginBottom: 8, fontWeight: 600, fontSize: "14px" }}>
                Couleur : {selectedColor?.name}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {colors.map((c, i) => {
                  const isSelected = i === selectedColorIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColorIndex(i)}
                      aria-label={c.name}
                      aria-pressed={isSelected}
                      title={c.name}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        backgroundColor: c.hex,
                        border: isSelected ? "2px solid #1F4E5F" : "1px solid rgba(0,0,0,0.2)",
                        boxShadow: isSelected ? "0 0 0 2px #fff inset" : "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      {isSelected && (
                        <Check
                          size={14}
                          color={isLightColor(c.hex) ? "#111" : "#fff"}
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="product-detail__actions">
            <div className="qty-selector">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>
                <Plus size={14} />
              </button>
            </div>
            <button className="btn btn-accent" onClick={handleAddToCart}>
              Ajouter au Panier
            </button>
            <button className="btn btn-dark" onClick={handleBuyNow}>
              Acheter Maintenant
            </button>
          </div>

          <div className="product-detail__delivery-box">
            <div className="delivery-option">
              <span className="delivery-option__label">
                <Package size={16} /> Livraison
              </span>
              <span className="delivery-option__note">Livraison à l'adresse indiquée</span>
              <span className="delivery-option__price">7 TND</span>
            </div>
            <div className="delivery-option">
              <span className="delivery-option__label">
                <Store size={16} /> Retrait local
              </span>
              <span className="delivery-option__note">Retirez votre commande en magasin</span>
              <span className="delivery-option__price">Gratuit</span>
            </div>
          </div>

          <div className="product-detail__meta">
            {product.sku && (
              <div>
                <strong>Référence :</strong> {product.sku}
              </div>
            )}
            <div>
              <strong>Catégorie :</strong> {product.category}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rough luminance check so the checkmark on a selected swatch stays
// readable against very light colors (e.g. white, pale yellow).
function isLightColor(hex) {
  if (!hex || typeof hex !== "string") return false;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
}

'@
Set-Content -Path "src\pages\ProductDetail.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."