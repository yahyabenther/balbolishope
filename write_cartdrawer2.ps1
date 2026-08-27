$content = @'
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { X, Minus, Plus } from "lucide-react";

function isHexColor(value) {
  return typeof value === "string" && value.startsWith("#");
}

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setCartOpen,
    updateQty,
    updateColor,
    removeItem,
    subtotal,
    amountToFreeShipping,
    freeShippingThreshold,
  } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  // Backward-compatible: older products may still use the single
  // color/colorHex fields instead of a colors array.
  const colorsFor = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return [];
    if (Array.isArray(product.colors)) return product.colors;
    if (product.color) return [{ name: product.color, hex: product.colorHex || "#000000" }];
    return [];
  };

  const progressPercent = Math.min(
    100,
    ((freeShippingThreshold - amountToFreeShipping) / freeShippingThreshold) * 100
  );

  return (
    <div className="cart-drawer-overlay" onClick={() => setCartOpen(false)}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer__header">
          <h2>Panier</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Fermer le panier">
            <X size={16} /> Fermer
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-drawer__empty">Votre panier est vide.</p>
        ) : (
          <ul className="cart-drawer__items">
            {items.map((it) => {
              const availableColors = colorsFor(it.productId);
              return (
                <li key={`${it.productId}-${it.color || "default"}`} className="cart-drawer__item">
                  {isHexColor(it.image) || !it.image ? (
                    <div
                      className="cart-drawer__item-image"
                      style={{ background: it.image || "#2c2c2e" }}
                    />
                  ) : (
                    <img className="cart-drawer__item-image" src={it.image} alt={it.name} />
                  )}
                  <div className="cart-drawer__item-info">
                    <div className="cart-drawer__item-name">{it.name}</div>

                    {availableColors.length > 0 ? (
                      <select
                        value={it.color || ""}
                        onChange={(e) => {
                          const chosen = availableColors.find((c) => c.name === e.target.value);
                          updateColor(it.productId, it.color, chosen || null);
                        }}
                        style={{
                          fontSize: "12px",
                          padding: "2px 6px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          margin: "4px 0",
                        }}
                      >
                        {availableColors.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : it.color ? (
                      <div style={{ fontSize: "12px", color: "#888", margin: "4px 0" }}>{it.color}</div>
                    ) : null}

                    <div className="cart-drawer__item-qty">
                      <button onClick={() => updateQty(it.productId, it.qty - 1, it.color)}>
                        <Minus size={12} />
                      </button>
                      <span>{it.qty}</span>
                      <button onClick={() => updateQty(it.productId, it.qty + 1, it.color)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-drawer__item-price">{(it.price * it.qty).toFixed(2)} TND</div>
                  <button
                    className="cart-drawer__item-remove"
                    onClick={() => removeItem(it.productId, it.color)}
                    aria-label="Retirer l'article"
                  >
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            {amountToFreeShipping > 0 ? (
              <p className="cart-drawer__shipping-msg">
                Ajoutez <strong>{amountToFreeShipping.toFixed(2)} TND</strong> à votre panier et profitez de la livraison gratuite !
              </p>
            ) : (
              <p className="cart-drawer__shipping-msg">Vous avez débloqué la livraison gratuite !</p>
            )}
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="cart-drawer__subtotal">
              <span>Sous-total :</span>
              <strong>{subtotal.toFixed(2)} TND</strong>
            </div>

            <button
              className="btn btn-outline cart-drawer__view-cart"
              onClick={() => {
                setCartOpen(false);
                navigate("/cart");
              }}
            >
              Voir le Panier
            </button>
            <button
              className="btn btn-accent cart-drawer__checkout"
              onClick={() => {
                setCartOpen(false);
                navigate("/checkout");
              }}
            >
              Passer la Commande
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

'@
Set-Content -Path "src\\components\\CartDrawer.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."