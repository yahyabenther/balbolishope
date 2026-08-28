import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { auth } from "../firebase";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState("verifying"); // verifying | ready | invalid | success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((verifiedEmail) => {
        setEmail(verifiedEmail);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("invalid");
      });
  }, [oobCode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
    } catch (err) {
      setError("Une erreur est survenue. Le lien a peut-être expiré.");
    }
    setSubmitting(false);
  }

  if (status === "verifying") {
    return (
      <div className="container account-page">
        <p>Vérification du lien...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="container account-page">
        <h1>Lien invalide</h1>
        <p>Ce lien de réinitialisation est invalide ou a expiré.</p>
        <button className="btn btn-accent" onClick={() => navigate("/account")}>
          Retour à la connexion
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="container account-page">
        <h1>Mot de passe modifié</h1>
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <button className="btn btn-accent" onClick={() => navigate("/account")}>
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="container account-page">
      <h1>Réinitialiser le mot de passe</h1>
      <p>Compte : {email}</p>
      {error && <div className="field-error account-page__error">{error}</div>}
      <form className="account-form" onSubmit={handleSubmit}>
        <label>Nouveau mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>Confirmer le mot de passe</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="btn btn-accent" type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
      <p style={{ marginTop: 20 }}>
        <Link to="/account">← Retour à la connexion</Link>
      </p>
    </div>
  );
}