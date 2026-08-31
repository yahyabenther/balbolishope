import React from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, MessageCircle, ShoppingBag, MapPin, Phone, Package } from "lucide-react";

// Admin's WhatsApp number, Tunisia country code included (no + or leading
// zero — that's the format wa.me expects).
const ADMIN_WHATSAPP_NUMBER = "21650519451";

function buildWhatsAppMessage(state) {
  const lines = [];

  lines.push(`Nouvelle commande${state.orderId ? ` #${state.orderId}` : ""}`);
  lines.push("");

  lines.push(`Client : ${state.customerName || "—"}`);
  if (state.phone) lines.push(`Téléphone : ${state.phone}`);
  if (state.phone2) lines.push(`Téléphone 2 : ${state.phone2}`);
  if (state.adresse) lines.push(`Adresse : ${state.adresse}`);
  if (state.ville || state.gouvernerat) {
    lines.push(`Ville / Gouvernorat : ${state.ville || "—"} / ${state.gouvernerat || "—"}`);
  }
  if (state.notes) lines.push(`Notes : ${state.notes}`);

  lines.push("");
  lines.push("Articles :");
  (state.items || []).forEach((it) => {
    const colorLabel = it.color ? ` (${it.color})` : "";
    lines.push(`- ${it.name}${colorLabel} x${it.qty} — ${(it.price * it.qty).toFixed(2)} TND`);
  });

  lines.push("");
  if (typeof state.subtotal === "number") lines.push(`Sous-total : ${state.subtotal.toFixed(2)} TND`);
  if (typeof state.shippingCost === "number") lines.push(`Livraison : ${state.shippingCost.toFixed(2)} TND`);
  if (typeof state.total === "number") lines.push(`Total : ${state.total.toFixed(2)} TND`);

  return lines.join("\n");
}

export default function OrderConfirmation() {
  const { state } = useLocation();

  function handleSendWhatsApp() {
    const message = buildWhatsAppMessage(state || {});
    const url = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="container order-confirmation" style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px" }}>
      {/* Success header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#e9f7ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle2 size={40} color="#1f9d55" strokeWidth={2} />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: "26px" }}>
          Merci{state?.customerName ? `, ${state.customerName}` : ""} !
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "15px" }}>
          Votre commande a été passée avec succès.
        </p>
        {state?.orderId && (
          <p style={{ margin: "6px 0 0", color: "#999", fontSize: "13px" }}>
            Commande N° {state.orderId}
          </p>
        )}
      </div>

      {state && (
        <>
          {/* Order summary card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: "24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <ShoppingBag size={18} color="#1F4E5F" />
              <h2 style={{ margin: 0, fontSize: "16px" }}>Résumé de la commande</h2>
            </div>

            {(state.items || []).length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
                {state.items.map((it, i) => (
                  <li
                    key={`${it.productId || it.name}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: i < state.items.length - 1 ? "1px solid #f2f2f2" : "none",
                      fontSize: "14px",
                    }}
                  >
                    <span>
                      {it.name}
                      {it.color && <span style={{ color: "#999" }}> — {it.color}</span>}
                      <span style={{ color: "#999" }}> × {it.qty}</span>
                    </span>
                    <span style={{ fontWeight: 600 }}>{(it.price * it.qty).toFixed(2)} TND</span>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
              {typeof state.subtotal === "number" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#666", marginBottom: 6 }}>
                  <span>Sous-total</span>
                  <span>{state.subtotal.toFixed(2)} TND</span>
                </div>
              )}
              {typeof state.shippingCost === "number" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#666", marginBottom: 6 }}>
                  <span>Livraison</span>
                  <span>{state.shippingCost === 0 ? "Gratuit" : `${state.shippingCost.toFixed(2)} TND`}</span>
                </div>
              )}
              {typeof state.total === "number" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 700, marginTop: 10 }}>
                  <span>Total</span>
                  <span>{state.total.toFixed(2)} TND</span>
                </div>
              )}
              <p style={{ fontSize: "13px", color: "#999", marginTop: 10, marginBottom: 0 }}>
                Payable en espèces à la livraison.
              </p>
            </div>
          </div>

          {/* Delivery details card */}
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 24,
              fontSize: "14px",
              color: "#444",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Package size={17} color="#1F4E5F" />
              <strong>Livraison</strong>
            </div>
            {state.adresse && (
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <MapPin size={15} style={{ flexShrink: 0, marginTop: 2, color: "#999" }} />
                <span>
                  {state.adresse}
                  {state.ville ? `, ${state.ville}` : ""}
                  {state.gouvernerat ? ` (${state.gouvernerat})` : ""}
                </span>
              </div>
            )}
            {state.phone && (
              <div style={{ display: "flex", gap: 8 }}>
                <Phone size={15} style={{ flexShrink: 0, marginTop: 2, color: "#999" }} />
                <span>
                  {state.phone}
                  {state.phone2 ? ` / ${state.phone2}` : ""}
                </span>
              </div>
            )}
            <p style={{ marginTop: 12, marginBottom: 0, color: "#777" }}>
              Vous recevrez un appel pour confirmer les détails de la livraison.
            </p>
          </div>

          {/* WhatsApp option */}
          <div
            style={{
              border: "1px solid #dff3e6",
              background: "#f4fcf7",
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#444" }}>
              Vous pouvez aussi envoyer les détails de votre commande directement à notre équipe.
            </p>
            <button
              onClick={handleSendWhatsApp}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#25D366",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 22px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <MessageCircle size={18} />
              Envoyer par WhatsApp
            </button>
          </div>
        </>
      )}

      <div style={{ textAlign: "center" }}>
        <Link
          to="/"
          className="btn btn-outline"
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          Continuer les Achats
        </Link>
      </div>
    </div>
  );
}