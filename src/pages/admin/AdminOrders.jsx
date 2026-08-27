import { useState } from "react";
import { useOrders } from "../../context/OrderContext";
import ExcelJS from "exceljs";

// Local yyyy-mm-dd for a given date, matching what an <input type="date">
// picker produces — used to compare against the date filter without
// timezone drift.
function toDateInputValue(d) {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STATUS_COLORS = {
  pending: "#B8860B", // amber/gold
  shipped: "#1F7A8C", // teal/blue
  delivered: "#2E7D32", // green
  cancelled: "#C0392B", // red
};

const STATUS_BG = {
  pending: "#FDF3DC",
  shipped: "#E1F0F3",
  delivered: "#E5F3E6",
  cancelled: "#FBE7E5",
};

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState(""); // order #, name, or phone
  const [searchDate, setSearchDate] = useState(""); // yyyy-mm-dd from the date picker

  // "Undelivered" = any status that isn't "delivered".
  const undeliveredOrders = orders.filter((o) => o.status !== "delivered");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOrders = orders.filter((o) => {
    if (normalizedSearch) {
      const orderId = (o.id || "").toLowerCase();
      const clientName = (o.Client?.nom || "").toLowerCase();
      const phone = (o.Client?.telephone || "").toLowerCase();
      const phone2 = (o.Client?.telephone2 || "").toLowerCase();
      const matchesText =
        orderId.includes(normalizedSearch) ||
        clientName.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        phone2.includes(normalizedSearch);
      if (!matchesText) return false;
    }

    if (searchDate) {
      if (!o.createdAt) return false;
      if (toDateInputValue(o.createdAt) !== searchDate) return false;
    }

    return true;
  });

  const hasActiveFilters = normalizedSearch || searchDate;
  const clearFilters = () => {
    setSearch("");
    setSearchDate("");
  };

  const getAddress = (client) =>
    [client?.adresse, client?.ville, client?.gouvernerat].filter(Boolean).join(", ");

  const exportUndeliveredToExcel = async () => {
    if (undeliveredOrders.length === 0) {
      alert("Aucune commande non livrée à exporter.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Admin Dashboard";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Undelivered Orders", {
      views: [{ state: "frozen", ySplit: 1 }], // freeze the header row
    });

    sheet.columns = [
      { header: "nom", key: "nom", width: 20 },
      { header: "locality_id", key: "locality_id", width: 12 },
      { header: "gouvernerat", key: "gouvernerat", width: 14 },
      { header: "ville", key: "ville", width: 14 },
      { header: "adresse", key: "adresse", width: 30 },
      { header: "telephone", key: "telephone", width: 14 },
      { header: "telephone2", key: "telephone2", width: 14 },
      { header: "prix", key: "prix", width: 12 },
      { header: "designation", key: "designation", width: 30 },
      { header: "nombreArticle", key: "nombreArticle", width: 13 },
      { header: "commentaire", key: "commentaire", width: 22 },
      { header: "article", key: "article", width: 30 },
      { header: "nombreEchange", key: "nombreEchange", width: 13 },
      { header: "estFragile", key: "estFragile", width: 12 },
      { header: "ouvrirColis", key: "ouvrirColis", width: 12 },
      { header: "Order #", key: "orderId", width: 14 },
      { header: "Status", key: "status", width: 14 },
    ];

    undeliveredOrders.forEach((o) => {
      const client = o.Client || {};
      const produit = o.Produit || {};
      sheet.addRow({
        nom: client.nom || "",
        locality_id: "",
        gouvernerat: client.gouvernerat || "",
        ville: client.ville || "",
        adresse: client.adresse || "",
        telephone: client.telephone || "",
        telephone2: client.telephone2 || "",
        prix: Number(produit.prix ?? o.total ?? 0),
        designation: produit.designation || (o.items || []).map((it) => it.color ? `${it.name} (${it.color})` : it.name).join(", "),
        nombreArticle: produit.nombreArticle ?? (o.items || []).reduce((n, it) => n + (it.qty || 0), 0),
        commentaire: produit.commentaire || "",
        article: produit.article || (o.items || []).map((it) => it.color ? `${it.name} (${it.color})` : it.name).join(", "),
        nombreEchange: produit.nombreEchange ?? 0,
        estFragile: produit.estFragile || "non",
        ouvrirColis: produit.ouvrirColis || "non",
        orderId: o.id,
        status: o.status,
      });
    });

    // --- Header row styling ---
    const headerRow = sheet.getRow(1);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E5F" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });

    // --- Body styling: currency format, borders, zebra striping, status colors ---
    const STATUS_FILL = {
      pending: "FFFFF3CD", // soft yellow
      shipped: "FFD6EAF8", // soft blue
      cancelled: "FFF8D7DA", // soft red
    };

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header already styled

      const isEven = rowNumber % 2 === 0;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: "hair", color: { argb: "FFE0E0E0" } },
          bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
          left: { style: "hair", color: { argb: "FFE0E0E0" } },
          right: { style: "hair", color: { argb: "FFE0E0E0" } },
        };
        if (isEven) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F9FA" } };
        }
        cell.alignment = { vertical: "middle" };
      });

      // "prix" is column 8 — format as currency
      row.getCell(8).numFmt = '#,##0.00 "TND"';
      row.getCell(8).alignment = { vertical: "middle", horizontal: "right" };

      // Color the Status cell (column 17) by status
      const statusCell = row.getCell(17);
      const fill = STATUS_FILL[statusCell.value];
      if (fill) {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      }
      statusCell.alignment = { vertical: "middle", horizontal: "center" };
      statusCell.font = { bold: true };
    });

    sheet.autoFilter = { from: "A1", to: "Q1" };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const today = new Date().toISOString().split("T")[0];
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `undelivered-orders-${today}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div
        className="admin-orders-header"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <h1 style={{ margin: 0 }}>Commandes</h1>
        <button className="admin-btn" onClick={exportUndeliveredToExcel}>
          Exporter les commandes non livrées (Excel)
        </button>
      </div>

      <div
        className="admin-search-bar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          margin: "12px 0",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          className="admin-search"
          placeholder="Rechercher par n° de commande, nom du client ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 260px",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        />

        <input
          type="date"
          className="admin-search-date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        {hasActiveFilters && (
          <button type="button" className="admin-btn" onClick={clearFilters}>
            Effacer
          </button>
        )}
      </div>

      {orders.length === 0 && <p>Aucune commande pour le moment.</p>}

      {orders.length > 0 && filteredOrders.length === 0 && (
        <p>Aucune commande ne correspond à votre recherche.</p>
      )}

      {filteredOrders.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Date</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Total</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td>{o.Client?.nom || "Invité"}</td>
                  <td>{o.Client?.telephone || "—"}</td>
                  <td>${Number(o.total || 0).toFixed(2)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      style={{
                        color: STATUS_COLORS[o.status],
                        backgroundColor: STATUS_BG[o.status],
                        fontWeight: 600,
                        fontSize: "12.5px",
                        border: `1px solid ${STATUS_COLORS[o.status]}33`,
                        borderRadius: "999px",
                        padding: "5px 12px",
                        cursor: "pointer",
                        outline: "none",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 10px center",
                        paddingRight: "26px",
                      }}
                    >
                      <option value="pending" style={{ color: STATUS_COLORS.pending, background: "#fff" }}>
                        En attente
                      </option>
                      <option value="shipped" style={{ color: STATUS_COLORS.shipped, background: "#fff" }}>
                        Expédiée
                      </option>
                      <option value="delivered" style={{ color: STATUS_COLORS.delivered, background: "#fff" }}>
                        Livrée
                      </option>
                      <option value="cancelled" style={{ color: STATUS_COLORS.cancelled, background: "#fff" }}>
                        Annulée
                      </option>
                    </select>
                  </td>
                  <td>
                    <button className="admin-btn" onClick={() => setSelected(o)}>
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "90%", maxWidth: "620px", padding: "32px" }}
          >
            <h2>Commande #{selected.id}</h2>
            <p>
              <strong>Client :</strong> {selected.Client?.nom || "Invité"}
              {selected.Client?.email ? ` (${selected.Client.email})` : ""}
            </p>
            <p>
              <strong>Téléphone :</strong> {selected.Client?.telephone || "—"}
              {selected.Client?.telephone2 ? ` / ${selected.Client.telephone2}` : ""}
            </p>
            <p>
              <strong>Adresse :</strong> {getAddress(selected.Client) || "—"}
            </p>

            <ul className="admin-order-items" style={{ listStyle: "none", padding: 0 }}>
              {selected.items?.map((item, i) => (
                <li
                  key={`${item.productId}-${item.color || "default"}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    style={{
                      width: "56px",
                      height: "56px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                    }}
                  />
                  <span style={{ fontSize: "15px" }}>
                    {item.name}
                    {item.color && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          marginLeft: 8,
                          fontSize: "13px",
                          color: "#555",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: item.colorHex || "#ccc",
                            border: "1px solid rgba(0,0,0,0.2)",
                          }}
                        />
                        {item.color}
                      </span>
                    )}
                    {" "}× {item.qty} — ${Number((item.price || 0) * (item.qty || 0)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <p>
              <strong>Total :</strong> ${Number(selected.total || 0).toFixed(2)}
            </p>
            <button className="admin-btn" onClick={() => setSelected(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}