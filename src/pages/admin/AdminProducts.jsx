import { useRef, useState } from "react";
import { Plus, Pencil, X, Image as ImageIcon, Camera, FolderOpen, Smartphone, Shield, Cable, Headphones, Wrench } from "lucide-react";
import { useProducts } from "../../context/ProductContext";

const CATEGORIES = [
  { id: "phones", name: "Téléphones", icon: Smartphone },
  { id: "cases", name: "Coques", icon: Shield },
  { id: "chargers", name: "Chargeurs et Câbles", icon: Cable },
  { id: "audio", name: "Audio", icon: Headphones },
  { id: "accessories", name: "Accessoires", icon: Wrench },
];

const EMPTY_FORM = {
  name: "",
  price: "",
  oldPrice: "",
  sku: "",
  category: "",
  colors: [], // [{ name, hex }, ...] — customers pick one of these on the product page
  image: "",
  description: "",
  inStock: true, // simple availability toggle instead of a stock count
  newArrival: false,
  promotion: false,
  bestSeller: false,
  featured: false,
};

const EMPTY_COLOR_DRAFT = { name: "", hex: "#000000" };

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const [form, setForm] = useState(EMPTY_FORM);
  const [colorDraft, setColorDraft] = useState(EMPTY_COLOR_DRAFT);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const addColor = () => {
    const name = colorDraft.name.trim() || `Couleur ${colorDraft.hex.toUpperCase()}`;
    setForm((f) => ({ ...f, colors: [...f.colors, { name, hex: colorDraft.hex }] }));
    setColorDraft(EMPTY_COLOR_DRAFT);
  };

  const removeColor = (index) => {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== index) }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, image: dataUrl }));
    e.target.value = "";
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setColorDraft(EMPTY_COLOR_DRAFT);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    // Backward-compatible: older products may still have the single
    // color/colorHex fields instead of a colors array.
    const colors = Array.isArray(product.colors)
      ? product.colors
      : product.color
      ? [{ name: product.color, hex: product.colorHex || "#000000" }]
      : [];
    setForm({
      name: product.name || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      sku: product.sku || "",
      category: product.category || "",
      colors,
      image: product.images?.[0] || product.image || "",
      description: product.description || "",
      // Backward-compatible: older products may still have a numeric
      // "stock" field instead of the boolean "inStock" flag.
      inStock:
        typeof product.inStock === "boolean" ? product.inStock : (product.stock ?? 0) > 0,
      newArrival: !!product.tags?.newArrival,
      promotion: !!product.tags?.promotion,
      bestSeller: !!product.tags?.bestSeller,
      featured: !!product.tags?.featured,
    });
    setColorDraft(EMPTY_COLOR_DRAFT);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setColorDraft(EMPTY_COLOR_DRAFT);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const { image, newArrival, promotion, bestSeller, featured, oldPrice, inStock, ...rest } = form;
    const payload = {
      ...rest,
      images: image ? [image] : [],
      price: parseFloat(form.price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      inStock,
      tags: { newArrival, promotion, bestSeller, featured },
    };

    if (editingProduct) {
      if (typeof updateProduct === "function") {
        updateProduct(editingProduct.id, payload);
      } else {
        deleteProduct(editingProduct.id);
        addProduct({ ...payload, id: editingProduct.id });
      }
    } else {
      addProduct(payload);
    }

    closeForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Produits</h1>
          <p>{products.length} produit{products.length !== 1 ? "s" : ""} au catalogue</p>
        </div>
        <button className="admin-btn" onClick={openCreateForm}>
          <Plus size={15} style={{ verticalAlign: -2, marginRight: 4 }} /> Ajouter un produit
        </button>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty">Aucun produit pour le moment.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Couleur</th>
                <th>Prix</th>
                <th>Disponibilité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                // Backward-compatible: older products may still have a
                // numeric "stock" field instead of the boolean "inStock".
                const isInStock =
                  typeof p.inStock === "boolean" ? p.inStock : (p.stock ?? 0) > 0;
                return (
                  <tr key={p.id}>
                    <td>{p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="admin-thumb" /> : "—"}</td>
                    <td>{p.name}</td>
                    <td>{CATEGORIES.find((c) => c.id === p.category)?.name || p.category || "—"}</td>
                    <td>
                      {p.colors?.length ? (
                        <span style={{ display: "inline-flex", gap: 4 }}>
                          {p.colors.map((c, i) => (
                            <span
                              key={i}
                              title={c.name}
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                backgroundColor: c.hex || "#ccc",
                                border: "1px solid rgba(0,0,0,0.15)",
                              }}
                            />
                          ))}
                        </span>
                      ) : p.color ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              backgroundColor: p.colorHex || "#ccc",
                              border: "1px solid rgba(0,0,0,0.15)",
                            }}
                          />
                          {p.color}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      {isInStock ? (
                        <span className="admin-badge admin-badge--delivered">En stock</span>
                      ) : (
                        <span className="admin-badge admin-badge--cancelled">Rupture</span>
                      )}
                    </td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="admin-btn" onClick={() => openEditForm(p)}>
                        <Pencil size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> Modifier
                      </button>
                      <button className="admin-btn-danger" onClick={() => handleDelete(p.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-backdrop" onClick={closeForm}>
          <div className="admin-modal admin-modal--form" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{editingProduct ? "Modifier le produit" : "Nouveau produit"}</h2>
              <button className="admin-modal__close" onClick={closeForm} aria-label="Fermer">
                <X size={17} />
              </button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div>
                <label>Photo du produit</label>
                <div className="admin-image-picker">
                  <div className="admin-image-picker__preview">
                    {form.image ? (
                      <img src={form.image} alt="Aperçu" />
                    ) : (
                      <ImageIcon size={22} />
                    )}
                  </div>
                  <div className="admin-image-picker__buttons">
                    <button
                      type="button"
                      className="admin-image-picker__btn"
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <FolderOpen size={16} /> Choisir depuis la galerie
                    </button>
                    <button
                      type="button"
                      className="admin-image-picker__btn admin-image-picker__btn--camera"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera size={16} /> Prendre une photo
                    </button>
                    {form.image && (
                      <button
                        type="button"
                        className="admin-image-picker__remove"
                        onClick={() => setForm((f) => ({ ...f, image: "" }))}
                      >
                        Retirer la photo
                      </button>
                    )}
                  </div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    style={{ display: "none" }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFile}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pf-name">Nom</label>
                <input id="pf-name" name="name" placeholder="Nom du produit" value={form.name} onChange={handleChange} required />
              </div>

              <div className="admin-modal-form__row">
                <div>
                  <label htmlFor="pf-price">Prix</label>
                  <input id="pf-price" name="price" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="pf-oldPrice">Ancien prix (optionnel)</label>
                  <input id="pf-oldPrice" name="oldPrice" type="number" step="0.01" placeholder="0.00" value={form.oldPrice} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-modal-form__row">
                <div>
                  <label htmlFor="pf-inStock">Disponibilité</label>
                  <select
                    id="pf-inStock"
                    name="inStock"
                    value={form.inStock ? "true" : "false"}
                    onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.value === "true" }))}
                  >
                    <option value="true">En stock</option>
                    <option value="false">Rupture de stock</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pf-sku">Référence (SKU)</label>
                  <input id="pf-sku" name="sku" placeholder="0999" value={form.sku} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label htmlFor="pf-category">Catégorie</label>
                <select id="pf-category" name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Choisir une catégorie</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Couleurs disponibles</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <input
                    type="text"
                    placeholder="Nom (ex. Noir, Bleu Marine...)"
                    value={colorDraft.name}
                    onChange={(e) => setColorDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addColor();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={colorDraft.hex}
                    onChange={(e) => setColorDraft((d) => ({ ...d, hex: e.target.value }))}
                    style={{ width: "48px", height: "42px", padding: "4px", cursor: "pointer" }}
                  />
                  <button type="button" className="admin-btn" onClick={addColor}>
                    Ajouter
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: 10 }}>
                  Saisissez un nom puis cliquez sur "Ajouter" (ou appuyez sur Entrée).
                </p>

                {form.colors.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {form.colors.map((c, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 10px",
                          borderRadius: "999px",
                          border: "1px solid #ddd",
                          fontSize: "13px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: c.hex,
                            border: "1px solid rgba(0,0,0,0.15)",
                          }}
                        />
                        {c.name}
                        <button
                          type="button"
                          onClick={() => removeColor(i)}
                          aria-label={`Retirer ${c.name}`}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="pf-description">Description</label>
                <textarea id="pf-description" name="description" placeholder="Description du produit" value={form.description} onChange={handleChange} />
              </div>

              <div>
                <label>Sections d'affichage</label>
                <div className="admin-modal-form__checkboxes">
                  <label>
                    <input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange} /> Nouveauté
                  </label>
                  <label>
                    <input type="checkbox" name="promotion" checked={form.promotion} onChange={handleChange} /> Promotion
                  </label>
                  <label>
                    <input type="checkbox" name="bestSeller" checked={form.bestSeller} onChange={handleChange} /> Meilleure vente
                  </label>
                  <label>
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> En vedette
                  </label>
                </div>
              </div>

              <div className="admin-modal-form__actions">
                <button type="button" className="admin-link admin-logout-btn" onClick={closeForm}>
                  Annuler
                </button>
                <button className="admin-btn" type="submit">
                  {editingProduct ? "Enregistrer les modifications" : "Enregistrer le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}