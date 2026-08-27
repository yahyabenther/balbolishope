import { useState } from "react";
import { Truck, Store, Users, Plus, Trash2, ShieldCheck, Shield } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useAdminUsers } from "../../context/AdminUsersContext";

const EMPTY_USER = { name: "", email: "", password: "", role: "moderator" };

function initialsOf(name, email) {
  const source = name || email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function AdminSettings() {
  const { settings, updateSettings } = useSettings();
  const { adminUsers, addAdminUser, removeAdminUser, updateAdminUserRole } = useAdminUsers();

  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee);
  const [freeThreshold, setFreeThreshold] = useState(settings.freeDeliveryThreshold);
  const [pickupEnabled, setPickupEnabled] = useState(settings.pickupEnabled);
  const [savedFlash, setSavedFlash] = useState(false);

  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_USER);

  const handleSaveDelivery = (e) => {
    e.preventDefault();
    updateSettings({
      deliveryFee: parseFloat(deliveryFee) || 0,
      freeDeliveryThreshold: parseFloat(freeThreshold) || 0,
      pickupEnabled,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    addAdminUser(newUser);
    setNewUser(EMPTY_USER);
    setShowUserForm(false);
  };

  const handleRemoveUser = (id) => {
    if (window.confirm("Retirer cet accès administrateur ?")) {
      removeAdminUser(id);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Paramètres</h1>
          <p>Livraison et accès administrateurs</p>
        </div>
      </div>

      {/* ---- Delivery settings ---- */}
      <div className="admin-settings-card">
        <div className="admin-settings-card__header">
          <div className="admin-settings-card__icon">
            <Truck size={18} />
          </div>
          <div>
            <h3>Livraison</h3>
            <p>Définit le tarif affiché sur les pages produit et au checkout</p>
          </div>
        </div>

        <form className="admin-settings-form" onSubmit={handleSaveDelivery}>
          <div className="admin-settings-form__row">
            <div>
              <label htmlFor="delivery-fee">Frais de livraison (TND)</label>
              <input
                id="delivery-fee"
                type="number"
                step="0.01"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="free-threshold">Livraison gratuite dès (TND)</label>
              <input
                id="free-threshold"
                type="number"
                step="0.01"
                min="0"
                placeholder="0 = désactivé"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
              />
            </div>
          </div>

          <label className="admin-toggle-row">
            <span className="admin-toggle-row__text">
              <Store size={16} />
              Retrait local (gratuit) activé
            </span>
            <span
              className={`admin-toggle${pickupEnabled ? " admin-toggle--on" : ""}`}
              onClick={() => setPickupEnabled((v) => !v)}
              role="switch"
              aria-checked={pickupEnabled}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPickupEnabled((v) => !v);
                }
              }}
            >
              <span className="admin-toggle__knob" />
            </span>
          </label>

          <div className="admin-modal-form__actions" style={{ borderTop: "none", paddingTop: 0 }}>
            {savedFlash && <span className="admin-settings-saved">Enregistré ✓</span>}
            <button className="admin-btn" type="submit">
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* ---- Admin / moderator accounts ---- */}
      <div className="admin-settings-card">
        <div className="admin-settings-card__header">
          <div className="admin-settings-card__icon">
            <Users size={18} />
          </div>
          <div>
            <h3>Administrateurs</h3>
            <p>Comptes ayant accès au panneau d'administration</p>
          </div>
          <button className="admin-btn admin-settings-card__action" onClick={() => setShowUserForm((v) => !v)}>
            <Plus size={15} style={{ verticalAlign: -2, marginRight: 4 }} />
            {showUserForm ? "Annuler" : "Ajouter"}
          </button>
        </div>

        {showUserForm && (
          <form className="admin-modal-form" onSubmit={handleAddUser} style={{ marginBottom: 20 }}>
            <div className="admin-modal-form__row">
              <div>
                <label htmlFor="au-name">Nom</label>
                <input
                  id="au-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nom complet"
                  required
                />
              </div>
              <div>
                <label htmlFor="au-role">Rôle</label>
                <select
                  id="au-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Modérateur</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-form__row">
              <div>
                <label htmlFor="au-email">Email</label>
                <input
                  id="au-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="au-password">Mot de passe</label>
                <input
                  id="au-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="admin-modal-form__actions">
              <button className="admin-btn" type="submit">Créer le compte</button>
            </div>
          </form>
        )}

        <ul className="admin-user-list">
          {adminUsers.map((u) => (
            <li className="admin-user-list__item" key={u.id}>
              <span className="admin-avatar">{initialsOf(u.name, u.email)}</span>
              <div className="admin-user-list__info">
                <div className="admin-user-list__name">{u.name || u.email}</div>
                <div className="admin-user-list__email">{u.email}</div>
              </div>

              <select
                className="admin-status-select"
                value={u.role}
                onChange={(e) => updateAdminUserRole(u.id, e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Modérateur</option>
              </select>

              <span className={`admin-badge ${u.role === "admin" ? "admin-badge--delivered" : "admin-badge--pending"}`}>
                {u.role === "admin" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                {u.role === "admin" ? "Admin" : "Modérateur"}
              </span>

              <button
                className="admin-user-list__remove"
                onClick={() => handleRemoveUser(u.id)}
                aria-label="Retirer"
                title="Retirer l'accès"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}