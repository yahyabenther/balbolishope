import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useSettings } from "../context/SettingsContext";

const GOVERNORATES = [
  { value: "Tunis", label: "Tunis / تونس" },
  { value: "Ariana", label: "Ariana / أريانة" },
  { value: "Ben Arous", label: "Ben Arous / بن عروس" },
  { value: "Manouba", label: "Manouba / منوبة" },
  { value: "Nabeul", label: "Nabeul / نابل" },
  { value: "Zaghouan", label: "Zaghouan / زغوان" },
  { value: "Bizerte", label: "Bizerte / بنزرت" },
  { value: "Béja", label: "Béja / باجة" },
  { value: "Jendouba", label: "Jendouba / جندوبة" },
  { value: "Kef", label: "Kef / الكاف" },
  { value: "Siliana", label: "Siliana / سليانة" },
  { value: "Sousse", label: "Sousse / سوسة" },
  { value: "Monastir", label: "Monastir / المنستير" },
  { value: "Mahdia", label: "Mahdia / المهدية" },
  { value: "Sfax", label: "Sfax / صفاقس" },
  { value: "Kairouan", label: "Kairouan / القيروان" },
  { value: "Kasserine", label: "Kasserine / القصرين" },
  { value: "Sidi Bouzid", label: "Sidi Bouzid / سيدي بوزيد" },
  { value: "Gabès", label: "Gabès / قابس" },
  { value: "Medenine", label: "Medenine / مدنين" },
  { value: "Tataouine", label: "Tataouine / تطاوين" },
  { value: "Gafsa", label: "Gafsa / قفصة" },
  { value: "Tozeur", label: "Tozeur / توزر" },
  { value: "Kebili", label: "Kebili / قبلي" },
];

// Small helper: splits a "French / Arabic" bilingual string into two spans
// so CSS can style them differently (French = primary, Arabic = secondary).
// Falls back to plain text if the string doesn't contain " / ".
function Bilingual({ text }) {
  const parts = text.split(" / ");
  if (parts.length !== 2) return <>{text}</>;
  return (
    <>
      <span className="label-fr">{parts[0]}</span>{" "}
      <span className="label-ar">/ {parts[1]}</span>
    </>
  );
}

// Form fields are named to map 1:1 onto First Delivery's expected
// Client/Produit shape (see BACKEND_SETUP.md) so the Cloud Function
// doesn't need to rename anything before calling POST /create:
//   nom, telephone, telephone2, gouvernerat, ville, adresse
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { isLoggedIn, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { settings } = useSettings();

  // Delivery fee and free-shipping threshold now come from Admin > Paramètres
  // instead of being hardcoded. A threshold of 0 means free shipping is
  // disabled (matches the "0 = désactivé" hint in the admin form).
  const deliveryFee = Number(settings.deliveryFee) || 0;
  const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold) || 0;
  const qualifiesForFreeDelivery =
    freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    telephone2: "",
    adresse: "",
    gouvernerat: "Tunis",
    ville: "",
    email: "",
    notes: "",
  });
  const [autoFilled, setAutoFilled] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill from the logged-in user's saved profile, still fully editable.
  useEffect(() => {
    if (isLoggedIn && user) {
      setForm((prev) => ({
        ...prev,
        nom: user.name || "",
        telephone: user.phone || "",
        telephone2: user.phone2 || "",
        adresse: user.address || "",
        gouvernerat: user.governorate || "Tunis",
        ville: user.ville || user.governorate || "",
        email: user.email || "",
      }));
      setAutoFilled(true);
    }
  }, [isLoggedIn, user]);

  const shippingCost = qualifiesForFreeDelivery ? 0 : deliveryFee;
  const total = subtotal + shippingCost;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = "Le nom complet est requis. / الاسم الكامل مطلوب";
    if (!form.adresse.trim()) newErrors.adresse = "L'adresse est requise. / العنوان مطلوب";
    if (!form.ville.trim()) newErrors.ville = "La ville est requise. / المدينة مطلوبة";
    if (!/^(\+216)?\d{8}$/.test(form.telephone.trim()))
      newErrors.telephone = "Entrez un numéro de téléphone valide à 8 chiffres. / أدخل رقم هاتف صحيح مكوّن من 8 أرقام";
    if (form.telephone2 && !/^(\+216)?\d{8}$/.test(form.telephone2.trim()))
      newErrors.telephone2 = "Entrez un numéro de téléphone valide à 8 chiffres. / أدخل رقم هاتف صحيح مكوّن من 8 أرقام";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      newErrors.email = "Entrez une adresse e-mail valide. / أدخل بريدًا إلكترونيًا صحيحًا";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const orderPayload = {
        Client: {
          nom: form.nom,
          gouvernerat: form.gouvernerat,
          ville: form.ville,
          adresse: form.adresse,
          telephone: form.telephone,
          telephone2: form.telephone2,
          email: form.email,
        },
        Produit: {
          prix: total,
          designation: items.map((it) => it.name).join(", "),
          nombreArticle: items.reduce((n, it) => n + it.qty, 0),
          commentaire: form.notes,
          article: items.map((it) => it.name).join(", "),
          nombreEchange: 0,
        },
        items,
        subtotal,
        shippingCost,
        total,
      };

      const savedOrder = await addOrder(orderPayload);

      // Remember this contact info on the account for next time, so future
      // checkouts autofill instead of showing blank fields.
      if (isLoggedIn) {
        updateProfile({
          phone: form.telephone,
          phone2: form.telephone2,
          address: form.adresse,
          ville: form.ville,
          governorate: form.gouvernerat,
        });
      }

      clearCart();

      // Pass the full order details along so OrderConfirmation can offer
      // to send a WhatsApp message to the admin with everything needed
      // (name, phone, address, items, total) — not just the customer's
      // name and the total.
      navigate("/order-confirmation", {
        state: {
          customerName: form.nom,
          phone: form.telephone,
          phone2: form.telephone2,
          adresse: form.adresse,
          ville: form.ville,
          gouvernerat: form.gouvernerat,
          notes: form.notes,
          items,
          subtotal,
          shippingCost,
          total,
          orderId: savedOrder.id,
        },
      });
    } catch (err) {
      console.error("Order failed:", err);
      setErrors({ submit: "La commande a échoué, veuillez réessayer. / فشل الطلب، حاول مرة أخرى" });
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <p>
          Votre panier est vide. / سلة مشترياتك فارغة <Link to="/">Continuer les achats / متابعة التسوق</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Accueil / الرئيسية</Link> / <span className="current">Commande / الطلب</span>
      </div>

      {(autoFilled || (freeDeliveryThreshold > 0 && !qualifiesForFreeDelivery)) && (
        <div className="checkout__notices">
          {autoFilled && (
            <div className="checkout__notice checkout__notice--info">
              <Bilingual text="Nous avons rempli vos informations enregistrées — veuillez vérifier que tout est correct ci-dessous avant de confirmer votre commande. / لقد قمنا بملء معلوماتك المسجلة — يرجى التأكد من صحة كل شيء أدناه قبل تأكيد طلبك." />
            </div>
          )}

          {freeDeliveryThreshold > 0 && !qualifiesForFreeDelivery && (
            <div className="checkout__notice checkout__notice--shipping">
              <Bilingual
                text={`Ajoutez ${(freeDeliveryThreshold - subtotal).toFixed(
                  2
                )} TND de plus pour bénéficier de la livraison gratuite ! / أضف ${(
                  freeDeliveryThreshold - subtotal
                ).toFixed(2)} د.ت للاستفادة من التوصيل المجاني!`}
              />
            </div>
          )}
        </div>
      )}

      <form className="checkout" onSubmit={handlePlaceOrder}>
        <div className="checkout__summary">
          <h2 className="checkout__section-title">
            <Bilingual text="Votre Commande / طلبك" />
          </h2>

          <ul className="checkout__summary-items">
            {items.map((it) => (
              <li key={it.productId}>
                <span>
                  {it.name} × {it.qty}
                </span>
                <span>{(it.price * it.qty).toFixed(2)} TND</span>
              </li>
            ))}
          </ul>

          <div className="checkout__summary-row">
            <span><Bilingual text="Sous-total / المجموع الفرعي" /></span>
            <span>{subtotal.toFixed(2)} TND</span>
          </div>

          <div className="checkout__summary-row">
            <span><Bilingual text="Livraison / التوصيل" /></span>
            <span>
              {qualifiesForFreeDelivery ? (
                <>
                  <span style={{ textDecoration: "line-through", opacity: 0.6 }}>
                    {deliveryFee.toFixed(2)} TND
                  </span>{" "}
                  <Bilingual text="Gratuit / مجاني" />
                </>
              ) : (
                `${deliveryFee.toFixed(2)} TND`
              )}
            </span>
          </div>

          <div className="checkout__summary-row checkout__total">
            <span><Bilingual text="Total / المجموع" /></span>
            <span>{total.toFixed(2)} TND</span>
          </div>

          <h3 className="checkout__section-subtitle">
            <Bilingual text="Informations de Paiement / معلومات الدفع" />
          </h3>
          <div className="checkout__payment-box">
            <strong><Bilingual text="Paiement à la livraison / الدفع عند الاستلام" /></strong>
            <p><Bilingual text="Payez en espèces à la livraison. / ادفع نقدًا عند التوصيل." /></p>
          </div>

          <button className="btn btn-accent checkout__place-order" type="submit" disabled={submitting}>
            {submitting ? (
              <Bilingual text="Passation de la commande... / جارٍ تقديم الطلب..." />
            ) : (
              <Bilingual text="Passer la Commande / تقديم الطلب" />
            )}
          </button>
          {errors.submit && <div className="field-error">{errors.submit}</div>}
        </div>

        <div className="checkout__billing">
          <h2 className="checkout__section-title">
            <Bilingual text="Coordonnées de Facturation / معلومات الفوترة" />
          </h2>

          <div className="form-field">
            <label>
              <Bilingual text="Nom complet / الاسم الكامل" /> <span className="required">*</span>
            </label>
            <input value={form.nom} onChange={(e) => handleChange("nom", e.target.value)} />
            {errors.nom && <div className="field-error">{errors.nom}</div>}
          </div>

          <div className="form-field">
            <label>
              <Bilingual text="Adresse / العنوان" /> <span className="required">*</span>
            </label>
            <input
              placeholder="Entrez votre adresse complète / أدخل عنوانك الكامل"
              value={form.adresse}
              onChange={(e) => handleChange("adresse", e.target.value)}
            />
            {errors.adresse && <div className="field-error">{errors.adresse}</div>}
          </div>

          <div className="form-field">
            <label>
              <Bilingual text="Ville / المدينة" /> <span className="required">*</span>
            </label>
            <input value={form.ville} onChange={(e) => handleChange("ville", e.target.value)} />
            {errors.ville && <div className="field-error">{errors.ville}</div>}
          </div>

          <div className="form-field">
            <label>
              <Bilingual text="Gouvernorat / الولاية" /> <span className="required">*</span>
            </label>
            <select value={form.gouvernerat} onChange={(e) => handleChange("gouvernerat", e.target.value)}>
              {GOVERNORATES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>
              <Bilingual text="Numéro de Mobile / رقم الهاتف" /> <span className="required">*</span>
            </label>
            <input
              placeholder="20123456"
              value={form.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
            />
            {errors.telephone && <div className="field-error">{errors.telephone}</div>}
          </div>

          <div className="form-field">
            <label><Bilingual text="Deuxième téléphone (optionnel) / رقم هاتف ثاني (اختياري)" /></label>
            <input
              placeholder="20123456"
              value={form.telephone2}
              onChange={(e) => handleChange("telephone2", e.target.value)}
            />
            {errors.telephone2 && <div className="field-error">{errors.telephone2}</div>}
          </div>

          <div className="form-field">
            <label>
              <Bilingual text="E-mail / البريد الإلكتروني" /> <span className="required">*</span>
            </label>
            <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-field">
            <label><Bilingual text="Notes de commande (optionnel) / ملاحظات الطلب (اختياري)" /></label>
            <textarea
              placeholder="Notes concernant votre commande, ex. instructions spéciales pour la livraison. / ملاحظات حول طلبك، مثل تعليمات خاصة للتوصيل."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}