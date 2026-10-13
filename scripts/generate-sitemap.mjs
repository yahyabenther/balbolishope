// Generates public/sitemap.xml before `vite build`.
//
// - Static pages and categories are listed explicitly (they mirror the
//   routes in src/App.jsx and the `categories` array in
//   src/data/SampleProducts.js).
// - Product URLs are added from the Firestore "products" collection using
//   the public REST API. This is the same unauthenticated read the website
//   itself does in ProductContext.jsx, so no secret or private data is used.
//   Only document IDs are requested (no product fields are downloaded).
// - If the product fetch fails for any reason, the sitemap is still written
//   with the static pages and the build continues (never breaks deploys).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SITE = "https://www.balbalistore.tn";
const PROJECT_ID = "balbali-store-3aec4";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

const STATIC_PATHS = [
  "/",
  "/new-arrivals",
  "/promotions",
  "/best-sellers",
  "/featured",
  "/category/phones",
  "/category/cases",
  "/category/chargers",
  "/category/audio",
  "/category/accessories",
];

const MAX_URLS = 50000; // sitemap protocol limit

const escapeXml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

async function fetchProductIds() {
  const ids = [];
  let pageToken = "";
  do {
    // mask.fieldPaths=category keeps the payload tiny: we only need doc names.
    const url =
      `${FIRESTORE_URL}?pageSize=300&mask.fieldPaths=category` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`Firestore REST responded ${res.status}`);
    const data = await res.json();
    for (const d of data.documents ?? []) {
      ids.push(d.name.split("/").pop());
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return ids;
}

let productIds = [];
try {
  productIds = await fetchProductIds();
  console.log(`[sitemap] ${productIds.length} product(s) fetched from Firestore`);
} catch (err) {
  console.warn(
    `[sitemap] Could not fetch products (${err.message}). ` +
      "Writing sitemap with static pages only."
  );
}

const paths = [
  ...STATIC_PATHS,
  ...productIds.map((id) => `/product/${encodeURIComponent(id)}`),
].slice(0, MAX_URLS);

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  paths.map((p) => `  <url><loc>${escapeXml(SITE + p)}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
writeFileSync(out, xml, "utf8");
console.log(`[sitemap] wrote ${paths.length} URL(s) to public/sitemap.xml`);
