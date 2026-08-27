import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const AdminUsersContext = createContext(null);

export function AdminUsersProvider({ children }) {
  const { user, listUsers, addSubAdmin } = useAuth();

  // Admin-panel accounts are just regular "users" docs with an elevated
  // role — no separate storage needed. "id" is added for compatibility
  // with the AdminSettings UI, which expects a plain "id" field.
  const adminUsers = listUsers()
    .filter((u) => ["admin", "super_admin", "moderator"].includes(u.role))
    .map((u) => ({ ...u, id: u.uid }));

  // Creates a REAL Firebase Auth account + Firestore user doc with an
  // admin/moderator role (see AuthContext.addSubAdmin). Replaces the old
  // localStorage-only mock, which never created an actual working login.
  async function addAdminUser(profile) {
    const result = await addSubAdmin(profile);
    if (!result.ok) {
      alert(result.error || "Impossible de créer ce compte.");
    }
    return result;
  }

  // Firebase Auth accounts can't be deleted from the client SDK (that
  // requires the Admin SDK on a backend/Cloud Function). Instead, revoke
  // admin-panel access by demoting the account back to a regular
  // customer — their login still exists, but /admin/* is no longer
  // reachable for them.
  //
  // Safety check: an admin can never remove their OWN access this way —
  // if they were logged in and demoted themselves, they'd be instantly
  // kicked out of /admin with no way back in without another admin's
  // help (or none, if they were the only admin). So self-removal is
  // blocked outright, regardless of how many other admins exist.
  async function removeAdminUser(uid) {
    if (uid === user?.uid) {
      const message = "Vous ne pouvez pas supprimer votre propre compte administrateur.";
      alert(message);
      return { ok: false, error: message };
    }

    try {
      await updateDoc(doc(db, "users", uid), { role: "customer" });
      return { ok: true };
    } catch (error) {
      console.error("Failed to revoke admin access:", error);
      return { ok: false, error: error.message };
    }
  }

  async function updateAdminUserRole(uid, role) {
    try {
      await updateDoc(doc(db, "users", uid), { role });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  }

  return (
    <AdminUsersContext.Provider
      value={{ adminUsers, addAdminUser, removeAdminUser, updateAdminUserRole }}
    >
      {children}
    </AdminUsersContext.Provider>
  );
}

export function useAdminUsers() {
  const ctx = useContext(AdminUsersContext);
  if (!ctx) throw new Error("useAdminUsers must be used within an AdminUsersProvider");
  return ctx;
}