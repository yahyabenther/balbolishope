$content = @'
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { Minus, Plus, X } from "lucide-react";

export default function Cart() {
  const { items, updateQty, updateColor, removeItem, subtotal } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  // Backward-compatible: older products may still use the single
  // color/colorHex fields instead of a colors array.
  const colorsFor = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return [];
    if (Array.isArray(product.colors)) return product.colors;
    if (product.color) return [{ name: product.color, hex: product.colorHex || "#000000" }];
    return [];
  };

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> / <span className="current">Panier</span>
      </div>

      <h1>Votre panier</h1>

      {items.length === 0 ? (
        <p>
          Votre panier est vide. <Link to="/">Continuer les achats</Link>
        </p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Couleur</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Sous-total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const availableColors = colorsFor(it.productId);
                return (
                  <tr key={`${it.productId}-${it.color || "default"}`}>
                    <td>{it.name}</td>
                    <td>
                      {availableColors.length > 0 ? (
                        <select
                          value={it.color || ""}
                          onChange={(e) => {
                            const chosen = availableColors.find((c) => c.name === e.target.value);
                            updateColor(it.productId, it.color, chosen || null);
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                          }}
                        >
                          {availableColors.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : it.color ? (
                        it.color
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{it.price.toFixed(2)} TND</td>
                    <td>
                      <div className="qty-selector">
                        <button onClick={() => updateQty(it.productId, it.qty - 1, it.color)}>
                          <Minus size={14} />
                        </button>
                        <span>{it.qty}</span>
                        <button onClick={() => updateQty(it.productId, it.qty + 1, it.color)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td>{(it.price * it.qty).toFixed(2)} TND</td>
                    <td>
                      <button
                        onClick={() => removeItem(it.productId, it.color)}
                        aria-label="Retirer l'article"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="cart-page__summary">
            <div>
              <strong>Sous-total :</strong> {subtotal.toFixed(2)} TND
            </div>
            <button className="btn btn-accent" onClick={() => navigate("/checkout")}>
              Passer la Commande
            </button>
          </div>
        </>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\\pages\\Cart.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."