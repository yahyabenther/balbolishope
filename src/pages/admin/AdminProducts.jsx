import { useRef, useState } from "react";
import { Plus, Pencil, X, Image as ImageIcon, Camera, FolderOpen, Smartphone, Shield, Cable, Headphones, Wrench } from "lucide-react";
import { useProducts } from "../../context/ProductContext";

// --- Cloudinary config ---
const CLOUDINARY_CLOUD_NAME = "vk1hgcmc";
const CLOUDINARY_UPLOAD_PRESET = "balbali_products";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
}

const CATEGORIES = [
  { id: "phones", name: "Téléphones", icon: Smartphone },
  { id: "cases", name: "Coques", icon: Shield },
  { id: "chargers", name: "Chargeurs et Câbles", icon: Cable },
  { id: "audio", name: "Audio", icon: Headphones },
  { id: "accessories", name: "Accessoires", icon: Wrench },
];

const MAX_IMAGES = 5;

const EMPTY_FORM = {
  name: "",
  price: "",
  oldPrice: "",
  sku: "",
  category: "",
  colors: [],
  images: [], // up to MAX_IMAGES Cloudinary URLs
  description: "",
  inStock: true,
  newArrival: false,
  promotion: false,
  bestSeller: false,
  featured: false,
  showInSlider: false,
};

const EMPTY_COLOR_DRAFT = { name: "", hex: "#000000" };

export default function AdminProducts() {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const [form, setForm] = useState(EMPTY_FORM);
  const [colorDraft, setColorDraft] = useState(EMPTY_COLOR_DRAFT);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  // Uploads newly picked photos to Cloudinary and appends the returned
  // URLs to the images array (instead of overwriting), capped at
  // MAX_IMAGES. Extra files beyond the remaining slots are ignored.
  const handleImageFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - form.images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setUploading(true);
    try {
      const urls = await Promise.all(filesToAdd.map(uploadToCloudinary));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Échec de l'envoi de l'image. Vérifiez votre connexion et réessayez.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
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
    // Backward-compatible: older products may only have a single "image"
    // field instead of the "images" array.
    const images = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
    setForm({
      name: product.name || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      sku: product.sku || "",
      category: product.category || "",
      colors,
      images,
      description: product.description || "",
      // Backward-compatible: older products may still have a numeric
      // "stock" field instead of the boolean "inStock" flag.
      inStock:
        typeof product.inStock === "boolean" ? product.inStock : (product.stock ?? 0) > 0,
      newArrival: !!product.tags?.newArrival,
      promotion: !!product.tags?.promotion,
      bestSeller: !!product.tags?.bestSeller,
      featured: !!product.tags?.featured,
      showInSlider: !!product.showInSlider,
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

    const { newArrival, promotion, bestSeller, featured, oldPrice, inStock, ...rest } = form;
    const payload = {
      ...rest,
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

  const remainingSlots = MAX_IMAGES - form.images.length;

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
                    <td>{Number(p.price).toFixed(2)} TND</td>
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
                <label>Photos du produit ({form.images.length}/{MAX_IMAGES})</label>
                <div className="admin-image-picker">
                  {form.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                      {form.images.map((img, i) => (
                        <div
                          key={i}
                          style={{
                            position: "relative",
                            width: 72,
                            height: 72,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "1px solid #ddd",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Aperçu ${i + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            aria-label={`Retirer la photo ${i + 1}`}
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: "none",
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.images.length === 0 && !uploading && (
                    <div className="admin-image-picker__preview">
                      <ImageIcon size={22} />
                    </div>
                  )}

                  {uploading && (
                    <p style={{ fontSize: "13px", color: "#666" }}>Envoi de la photo en cours...</p>
                  )}

                  {remainingSlots > 0 && !uploading ? (
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
                    </div>
                  ) : remainingSlots === 0 ? (
                    <p style={{ fontSize: "12px", color: "#888" }}>
                      Maximum de {MAX_IMAGES} photos atteint. Retirez-en une pour en ajouter une autre.
                    </p>
                  ) : null}

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
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
                <button className="admin-btn" type="submit" disabled={uploading}>
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