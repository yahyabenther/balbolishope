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
  const { isLoggedIn, user, login, register, logout, updateProfile, resetPassword, loginWithGoogle } = useAuth();
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

  async function handleGoogleLogin() {
    setLoginErrors({});
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);

    if (result.ok) {
      navigate("/");
    } else {
      setLoginErrors({
        password: "La connexion avec Google a échoué. / فشل تسجيل الدخول عبر جوجل",
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

          <div className="account-form__divider">
            <span>ou / أو</span>
          </div>

          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={submitting}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.02l7.73 6c4.51-4.18 7.09-10.36 7.09-17.49z"/>
              <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24 24 0 000 21.56l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuer avec Google / متابعة مع جوجل
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