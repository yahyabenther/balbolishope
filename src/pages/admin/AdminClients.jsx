import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";

function initialsOf(name, email) {
  const source = (name || "").trim() || email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function AdminClients() {
  const { clients } = useAuth();
  const { orders } = useOrders();
  const [selected, setSelected] = useState(null);

  // Orders store the buyer under "Client" (nom, telephone, adresse, ...),
  // matched back to the account by email.
  const ordersFor = (email) =>
    orders
      .filter((o) => o.Client?.email === email)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // The account itself has no phone/address — those are only ever
  // captured at checkout. Use the most recent order's Client info as the
  // "last known" contact details for that person.
  const contactFor = (email) => {
    const latest = ordersFor(email)[0];
    if (!latest?.Client) return null;
    return {
      phone: latest.Client.telephone,
      phone2: latest.Client.telephone2,
      address: [latest.Client.adresse, latest.Client.ville, latest.Client.gouvernerat]
        .filter(Boolean)
        .join(", "),
      gouvernerat: latest.Client.gouvernerat,
    };
  };

  const statsFor = (email) => {
    const clientOrders = ordersFor(email);
    const total = clientOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return { count: clientOrders.length, total };
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Clients</h1>
          <p>{clients.length} client{clients.length !== 1 ? "s" : ""} inscrit{clients.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {clients.length === 0 && <div className="admin-empty">Aucun client inscrit pour le moment.</div>}

      {clients.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Gouvernorat</th>
                <th>Commandes</th>
                <th>Total dépensé</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const { count, total } = statsFor(c.email);
                const contact = contactFor(c.email);
                return (
                  <tr key={c.email}>
                    <td>
                      <span className="admin-name-cell">
                        <span className="admin-avatar">{initialsOf(c.name, c.email)}</span>
                        {c.name || "—"}
                      </span>
                    </td>
                    <td>{c.email}</td>
                    <td>{contact?.phone || "—"}</td>
                    <td>{contact?.gouvernerat || "—"}</td>
                    <td>{count}</td>
                    <td>${total.toFixed(2)}</td>
                    <td>
                      <button className="admin-btn" onClick={() => setSelected(c)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              <span className="admin-avatar" style={{ marginRight: 10 }}>
                {initialsOf(selected.name, selected.email)}
              </span>
              {selected.name || "—"}
            </h2>

            <p>
              <strong>Email:</strong> {selected.email}
            </p>
            <p>
              <strong>Inscrit le:</strong>{" "}
              {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}
            </p>

            {(() => {
              const contact = contactFor(selected.email);
              return (
                <>
                  <p>
                    <strong>Téléphone (dernière commande):</strong> {contact?.phone || "—"}
                    {contact?.phone2 ? ` / ${contact.phone2}` : ""}
                  </p>
                  <p>
                    <strong>Adresse (dernière commande):</strong> {contact?.address || "—"}
                  </p>
                </>
              );
            })()}

            {(() => {
              const { count, total } = statsFor(selected.email);
              return (
                <p>
                  <strong>{count}</strong> commande{count !== 1 ? "s" : ""} — <strong>${total.toFixed(2)}</strong> dépensé
                  {count !== 1 ? "s" : ""} au total
                </p>
              );
            })()}

            <h3 style={{ marginTop: 18 }}>Historique des commandes</h3>
            {(() => {
              const clientOrders = ordersFor(selected.email);
              if (clientOrders.length === 0) {
                return <p style={{ color: "var(--a-muted)" }}>Aucune commande pour ce client.</p>;
              }
              return (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {clientOrders.map((o) => (
                    <li
                      key={o.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        padding: "6px 0",
                      }}
                    >
                      <span>
                        #{o.id} — {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                      </span>
                      <span>
                        ${Number(o.total || 0).toFixed(2)} · {o.status}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            })()}

            <button className="admin-btn" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}