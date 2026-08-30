import { useMemo } from "react";
import { ShoppingBag, Users, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { useProducts } from "../../context/ProductContext";
import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

const STATUS_COLORS = {
  pending: "var(--a-gold)",
  shipped: "var(--a-teal)",
  delivered: "var(--a-green)",
  cancelled: "var(--a-red)",
};

const STATUS_LABELS = {
  pending: "En attente",
  shipped: "Expédiées",
  delivered: "Livrées",
  cancelled: "Annulées",
};

const STATUS_ICONS = {
  pending: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

// Custom currency icon (Tunisian Dinar) — lucide-react has no built-in DT
// icon, so this mimics its stroke-icon conventions (same `size` prop,
// inherits color via currentColor) to drop in wherever a lucide icon
// component is expected.
function DtIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="8"
        fontWeight="700"
        stroke="none"
        fill="currentColor"
      >
        DT
      </text>
    </svg>
  );
}

// Builds the last `count` months (oldest → newest) as {key, label} pairs
// anchored on today, so the chart always shows a rolling window.
function lastMonths(count) {
  const out = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] });
  }
  return out;
}

export default function AdminDashboard() {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { clients } = useAuth();

  // Only delivered orders count toward revenue — pending/shipped/cancelled
  // orders haven't actually paid out yet.
  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    [orders]
  );

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    return counts;
  }, [orders]);

  const stats = [
    { label: "Revenu total (livrées)", value: `${totalRevenue.toFixed(2)} DT`, icon: DtIcon, highlight: true },
    { label: STATUS_LABELS.pending, value: statusCounts.pending, icon: Clock },
    { label: STATUS_LABELS.shipped, value: statusCounts.shipped, icon: Truck },
    { label: STATUS_LABELS.delivered, value: statusCounts.delivered, icon: CheckCircle },
    { label: STATUS_LABELS.cancelled, value: statusCounts.cancelled, icon: XCircle },
    { label: "Commandes", value: orders.length, icon: ShoppingBag },
    { label: "Clients", value: clients.length, icon: Users },
    { label: "Produits", value: products.length, icon: Package },
  ];

  // ---- Orders vs delivered, by month (bar chart) ----
  const monthly = useMemo(() => {
    const months = lastMonths(6);
    const buckets = Object.fromEntries(months.map((m) => [m.key, { orders: 0, delivered: 0, revenue: 0 }]));
    orders.forEach((o) => {
      const d = new Date(o.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!buckets[key]) return;
      buckets[key].orders += 1;
      // Revenue trend chart also only counts delivered orders, to match
      // the "Revenu total" stat above.
      if (o.status === "delivered") {
        buckets[key].delivered += 1;
        buckets[key].revenue += Number(o.total) || 0;
      }
    });
    const maxOrders = Math.max(1, ...months.map((m) => buckets[m.key].orders));
    return months.map((m) => ({ ...m, ...buckets[m.key], maxOrders }));
  }, [orders]);

  const maxOrdersAcrossMonths = monthly.length ? monthly[0].maxOrders : 1;

  // ---- Status breakdown (donut chart) ----
  const statusBreakdown = useMemo(() => {
    const counts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    const total = orders.length || 1;
    let cursor = 0;
    const segments = Object.entries(counts).map(([status, count]) => {
      const pct = (count / total) * 100;
      const seg = { status, count, pct, start: cursor, end: cursor + pct };
      cursor += pct;
      return seg;
    });
    return { counts, total: orders.length, segments };
  }, [orders]);

  const donutGradient = statusBreakdown.segments
    .filter((s) => s.pct > 0)
    .map((s) => `${STATUS_COLORS[s.status]} ${s.start}% ${s.end}%`)
    .join(", ");

  const deliveredPct = statusBreakdown.total
    ? Math.round((statusBreakdown.counts.delivered / statusBreakdown.total) * 100)
    : 0;

  // ---- Revenue trend sparkline (last 6 months, delivered only) ----
  const trendPoints = useMemo(() => {
    const maxRevenue = Math.max(1, ...monthly.map((m) => m.revenue));
    const w = 100;
    const h = 100;
    const step = monthly.length > 1 ? w / (monthly.length - 1) : 0;
    return monthly.map((m, i) => {
      const x = i * step;
      const y = h - (m.revenue / maxRevenue) * h;
      return `${x},${y}`;
    });
  }, [monthly]);

  const trendLine = trendPoints.join(" ");
  const trendArea = `0,100 ${trendPoints.join(" ")} 100,100`;

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Dashboard</h1>
          <p>Vue d'ensemble de l'activité de la boutique</p>
        </div>
      </div>

      <div className="admin-stats">
        {stats.map((s) => (
          <div
            className={`admin-stat-card${s.highlight ? " admin-stat-card--highlight" : ""}`}
            key={s.label}
          >
            <div>
              <span className="admin-stat-value">{s.value}</span>
              <div className="admin-stat-label">{s.label}</div>
            </div>
            <div className="admin-stat-icon">
              <s.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>Commandes par mois</h3>
            <div className="admin-panel__legend">
              <span><i style={{ background: "var(--a-gold)" }} /> Total</span>
              <span><i style={{ background: "var(--a-navy)" }} /> Livrées</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <p style={{ color: "var(--a-muted)", fontSize: 13.5 }}>
              Pas encore assez de commandes pour afficher un graphique.
            </p>
          ) : (
            <>
              <div className="admin-barchart">
                {monthly.map((m) => (
                  <div className="admin-barchart__col" key={m.key} title={`${m.label}: ${m.orders} commandes, ${m.delivered} livrées`}>
                    <div
                      className="admin-barchart__bar admin-barchart__bar--orders"
                      style={{ height: `${(m.orders / maxOrdersAcrossMonths) * 100}%` }}
                    />
                    <div
                      className="admin-barchart__bar admin-barchart__bar--delivered"
                      style={{ height: `${(m.delivered / maxOrdersAcrossMonths) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="admin-barchart__labels">
                {monthly.map((m) => (
                  <span key={m.key}>{m.label}</span>
                ))}
              </div>
            </>
          )}

          <div className="admin-panel__header" style={{ marginTop: 26 }}>
            <h3>Tendance du revenu (livrées)</h3>
          </div>
          {orders.length === 0 ? (
            <p style={{ color: "var(--a-muted)", fontSize: 13.5 }}>—</p>
          ) : (
            <svg className="admin-trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--a-gold)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--a-gold)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={trendArea} fill="url(#trendFill)" />
              <polyline
                points={trendLine}
                fill="none"
                stroke="var(--a-gold)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>Statut des commandes</h3>
          </div>

          <div className="admin-donut-wrap">
            <div
              className="admin-donut"
              style={{ background: statusBreakdown.total ? `conic-gradient(${donutGradient})` : "var(--a-border)" }}
            >
              <div className="admin-donut__center">
                <strong>{deliveredPct}%</strong>
                <span>Livrées</span>
              </div>
            </div>

          </div>

          <div className="admin-stats">
            {Object.keys(STATUS_LABELS).map((status) => {
              const Icon = STATUS_ICONS[status];
              return (
                <div className="admin-stat-card" key={status}>
                  <div>
                    <span className="admin-stat-value">{statusBreakdown.counts[status]}</span>
                    <div className="admin-stat-label">{STATUS_LABELS[status]}</div>
                  </div>
                  <div className="admin-stat-icon" style={{ color: STATUS_COLORS[status] }}>
                    <Icon size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}