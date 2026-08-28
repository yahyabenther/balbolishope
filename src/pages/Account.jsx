import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

export default function Account() {
  const { isLoggedIn, user, login, register, logout, updateProfile, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [forgotMode, setForgotMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    phone2: "",
    address: "",
    governorate: "Tunis",
  });
  const [registerErrors, setRegisterErrors] = useState({});

  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    const errors = {};
    if (!loginForm.email.trim()) {
      errors.email = "Veuillez entrer votre e-mail. / يرجى إدخال البريد الإلكتروني";
    }
    if (!loginForm.password) {
      errors.password = "Veuillez entrer votre mot de passe. / يرجى إدخال كلمة السر";
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }
    setLoginErrors({});

    setSubmitting(true);
    const ok = await login(loginForm.email.trim(), loginForm.password);
    setSubmitting(false);

    if (ok) {
      navigate("/");
    } else {
      setLoginErrors({
        password: "E-mail ou mot de passe incorrect. / البريد الإلكتروني أو كلمة السر غير صحيحة",
      });
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    const errors = {};
    if (!registerForm.firstName.trim()) {
      errors.firstName = "Ce champ est requis. / هذه الخانة مطلوبة";
    }
    if (!registerForm.lastName.trim()) {
      errors.lastName = "Ce champ est requis. / هذه الخانة مطلوبة";
    }
    if (!registerForm.email.trim()) {
      errors.email = "Ce champ est requis. / هذه الخانة مطلوبة";
    }
    if (!registerForm.password) {
      errors.password = "Ce champ est requis. / هذه الخانة مطلوبة";
    }
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = "Ce champ est requis. / هذه الخانة مطلوبة";
    } else if (registerForm.password && registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas. / كلمتا السر غير متطابقتين";
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }
    setRegisterErrors({});

    setSubmitting(true);
    const name = `${registerForm.firstName} ${registerForm.lastName}`.trim();
    const result = await register({
      email: registerForm.email.trim(),
      password: registerForm.password,
      name,
    });

    if (!result.ok) {
      setSubmitting(false);
      setRegisterErrors(translateAuthError(result.error));
      return;
    }

    // Save the extra profile fields the account itself doesn't collect
    // by default (phone, address, governorate), so they're on file for
    // next time — e.g. autofill at checkout.
    await updateProfile({
      phone: registerForm.phone,
      phone2: registerForm.phone2,
      address: registerForm.address,
      governorate: registerForm.governorate,
    });

    setSubmitting(false);
    navigate("/");
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetMessage("Veuillez entrer votre e-mail. / يرجى إدخال البريد الإلكتروني");
      return;
    }

    setResetSubmitting(true);
    const result = await resetPassword(resetEmail.trim());
    setResetSubmitting(false);

    if (result.ok) {
      setResetMessage(
        "Un e-mail de réinitialisation a été envoyé. Vérifiez votre boîte de réception. / تم إرسال بريد إلكتروني لإعادة التعيين، تحقق من بريدك الوارد"
      );
    } else {
      setResetMessage(
        "Impossible d'envoyer l'e-mail. Vérifiez l'adresse. / تعذر إرسال البريد الإلكتروني، تحقق من العنوان"
      );
    }
  }

  if (isLoggedIn) {
    return (
      <div className="container account-page">
        <h1>Mon Compte / حسابي</h1>
        <p>
          Connecté en tant que / متصل باسم <strong>{user.name}</strong> ({user.email})
        </p>
        <button className="btn btn-outline" onClick={logout}>
          Déconnexion / تسجيل الخروج
        </button>
        <p style={{ marginTop: 20 }}>
          <Link to="/">← Retour aux achats / الرجوع للتسوق</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container account-page">
      {!forgotMode && (
        <div className="account-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setLoginErrors({}); setRegisterErrors({}); }}
          >
            Connexion / الدخول
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => { setMode("register"); setLoginErrors({}); setRegisterErrors({}); }}
          >
            Inscription / تسجيل حساب
          </button>
        </div>
      )}

      {forgotMode ? (
        <form className="account-form" onSubmit={handleForgotPassword}>
          <h2>Mot de passe oublié / نسيت كلمة السر</h2>
          <label>E-mail / البريد الإلكتروني</label>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          {resetMessage && <div className="field-error">{resetMessage}</div>}
          <button className="btn btn-accent" type="submit" disabled={resetSubmitting}>
            {resetSubmitting ? "Envoi en cours... / جارٍ الإرسال..." : "Envoyer le lien / إرسال الرابط"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 10 }}
            onClick={() => { setForgotMode(false); setResetMessage(""); setResetEmail(""); }}
          >
            ← Retour à la connexion / الرجوع للدخول
          </button>
        </form>
      ) : mode === "login" ? (
        <form className="account-form" onSubmit={handleLogin} noValidate>
          <label>E-mail / البريد الإلكتروني</label>
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          />
          {loginErrors.email && <div className="field-error">{loginErrors.email}</div>}

          <label>Mot de passe / كلمة السر</label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {loginErrors.password && <div className="field-error">{loginErrors.password}</div>}

          <button
            type="button"
            className="account-form__forgot-link"
            onClick={() => { setForgotMode(true); }}
          >
            Mot de passe oublié ? / نسيت كلمة السر؟
          </button>
          <button className="btn btn-accent" type="submit" disabled={submitting}>
            {submitting ? "Connexion en cours... / جارٍ الدخول..." : "Connexion / الدخول"}
          </button>
        </form>
      ) : (
        <form className="account-form" onSubmit={handleRegister} noValidate>
          <label>Prénom * / الإسم *</label>
          <input
            value={registerForm.firstName}
            onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
          />
          {registerErrors.firstName && <div className="field-error">{registerErrors.firstName}</div>}

          <label>Nom * / اللقب *</label>
          <input
            value={registerForm.lastName}
            onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
          />
          {registerErrors.lastName && <div className="field-error">{registerErrors.lastName}</div>}

          <label>Adresse / العنوان</label>
          <input
            value={registerForm.address}
            onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
          />

          <label>Gouvernorat / الولاية</label>
          <select
            value={registerForm.governorate}
            onChange={(e) => setRegisterForm({ ...registerForm, governorate: e.target.value })}
          >
            {GOVERNORATES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>

          <label>Numéro de Mobile / رقم الهاتف</label>
          <input
            value={registerForm.phone}
            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
          />

          <label>E-mail * / البريد الإلكتروني *</label>
          <input
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
          />
          {registerErrors.email && <div className="field-error">{registerErrors.email}</div>}

          <label>Mot de passe * / كلمة السر *</label>
          <input
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          />
          {registerErrors.password && <div className="field-error">{registerErrors.password}</div>}

          <label>Confirmer le mot de passe * / تأكيد كلمة السر *</label>
          <input
            type="password"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
          />
          {registerErrors.confirmPassword && <div className="field-error">{registerErrors.confirmPassword}</div>}

          <button className="btn btn-accent" type="submit" disabled={submitting}>
            {submitting ? "Création en cours... / جارٍ الإنشاء..." : "Créer un compte / إنشاء حساب"}
          </button>
        </form>
      )}
    </div>
  );
}

// Firebase returns technical error codes/messages — map the common ones
// to a field-specific message so it renders under the right input.
function translateAuthError(message) {
  if (!message) return { email: "Une erreur est survenue. / حدث خطأ ما" };
  if (message.includes("auth/email-already-in-use")) {
    return { email: "Un compte existe déjà avec cet e-mail. / يوجد حساب بهذا البريد الإلكتروني بالفعل" };
  }
  if (message.includes("auth/weak-password")) {
    return { password: "Le mot de passe doit contenir au moins 6 caractères. / يجب أن تتكون كلمة السر من 6 أحرف على الأقل" };
  }
  if (message.includes("auth/invalid-email")) {
    return { email: "Adresse e-mail invalide. / عنوان بريد إلكتروني غير صالح" };
  }
  return { email: "Une erreur est survenue. Veuillez réessayer. / حدث خطأ ما، حاول مرة أخرى" };
}