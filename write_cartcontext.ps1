$content = @'
import React, { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext(null);

const FREE_SHIPPING_THRESHOLD = 300; // TND — adjust to match the manager's policy

// A stable key for a cart line — same product + same color merges quantity,
// but different colors of the same product stay as separate lines.
function lineKey(productId, color) {
  return `${productId}::${color || "default"}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { productId, name, price, image, qty, color, colorHex }
  const [isCartOpen, setCartOpen] = useState(false);

  function addItem(product, qty = 1, selectedColor = null) {
    const color = selectedColor?.name || null;
    const colorHex = selectedColor?.hex || null;
    const key = lineKey(product.id, color);

    setItems((prev) => {
      const existing = prev.find((it) => lineKey(it.productId, it.color) === key);
      if (existing) {
        return prev.map((it) =>
          lineKey(it.productId, it.color) === key ? { ...it, qty: it.qty + qty } : it
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || null,
          qty,
          color,
          colorHex,
        },
      ];
    });

    setCartOpen(true); // opens the drawer whenever something is added
  }

  function updateQty(productId, qty, color = null) {
    if (qty <= 0) {
      removeItem(productId, color);
      return;
    }
    const key = lineKey(productId, color);
    setItems((prev) =>
      prev.map((it) => (lineKey(it.productId, it.color) === key ? { ...it, qty } : it))
    );
  }

  function removeItem(productId, color = null) {
    const key = lineKey(productId, color);
    setItems((prev) => prev.filter((it) => lineKey(it.productId, it.color) !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);
  const itemCount = useMemo(() => items.reduce((n, it) => n + it.qty, 0), [items]);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    isCartOpen,
    setCartOpen,
    amountToFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

'@
Set-Content -Path "src\\context\\CartContext.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."