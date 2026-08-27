import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection
} from "firebase/firestore";

const AuthContext = createContext(null);

const SECONDARY_APP_NAME = "Secondary-AddUser";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync users list for listUsers() & clients
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((docItem) => docItem.data());
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users list:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user metadata & role from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDocSnap.data() });
        } else {
          // Fallback if metadata doc is missing
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "customer" });
        }
      } else {
        setUser(null);
      }
      
      await fetchUsers();
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard user signup
  async function register(profile) {
    try {
      const { email, password, name } = profile;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        uid: firebaseUser.uid,
        email: email,
        name: name || "",
        role: "customer", // Default role
        createdAt: new Date().toISOString()
      };

      // Store user record in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      setUser(userData);
      await fetchUsers();

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  // Unified login for customers and admins
  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error.message);
      return false;
    }
  }

  // Logout current user
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  }

  // Save/merge extra profile fields (phone, address, city, governorate,
  // etc.) onto the logged-in user's account — e.g. called after checkout
  // so the next order can autofill from this saved info.
  async function updateProfile(fields) {
    if (!user?.uid) return { ok: false, error: "Not logged in." };
    try {
      await setDoc(doc(db, "users", user.uid), fields, { merge: true });
      setUser((prev) => ({ ...prev, ...fields }));
      await fetchUsers();
      return { ok: true };
    } catch (error) {
      console.error("Failed to update profile:", error.message);
      return { ok: false, error: error.message };
    }
  }

  // Add Sub-Admin or Moderator account (restricted to existing admins).
  //
  // Firebase Auth's client SDK only tracks ONE signed-in user per app
  // instance. Calling createUserWithEmailAndPassword on our normal `auth`
  // instance would create the new account AND immediately sign the
  // browser into it — silently kicking the current admin out of their
  // own session and into the new moderator's. To avoid that, the new
  // account is created on a short-lived secondary Firebase app instance
  // instead, which has its own isolated auth state. Once the account is
  // created we sign out of (and discard) that secondary instance —
  // the admin's real session on the primary `auth` instance is never
  // touched.
  async function addSubAdmin(profile) {
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return { ok: false, error: "Seul un administrateur peut ajouter un compte." };
    }

    // Clean up any leftover secondary instance from a previous call that
    // didn't get to finish (e.g. page refresh mid-request).
    const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
    if (existing) {
      await deleteApp(existing);
    }

    const secondaryApp = initializeApp(auth.app.options, SECONDARY_APP_NAME);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const { email, password, name, role } = profile;
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newAdmin = userCredential.user;

      const adminData = {
        uid: newAdmin.uid,
        email: email,
        name: name || "",
        role: role === "moderator" ? "moderator" : "admin",
        createdAt: new Date().toISOString()
      };

      // Written via the primary `db` — Firestore access isn't tied to
      // which auth instance is signed in, only to the current admin's
      // own session on the primary `auth`, which is untouched.
      await setDoc(doc(db, "users", newAdmin.uid), adminData);
      await fetchUsers();

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    } finally {
      // Sign out of the secondary instance and tear it down so it never
      // lingers or interferes with anything else.
      try {
        await signOut(secondaryAuth);
      } catch (_) {
        // ignore — instance is being deleted regardless
      }
      await deleteApp(secondaryApp);
    }
  }

  function listUsers() {
    return allUsers;
  }

  const clients = allUsers.filter((u) => u.role === "customer");
  const isAdmin = !!user && ["admin", "super_admin", "moderator"].includes(user.role);
  const isSuperAdmin = !!user && user.role === "super_admin";
  const isModerator = !!user && user.role === "moderator";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin,
        isSuperAdmin,
        isModerator,
        clients,
        register,
        login,
        logout,
        updateProfile,
        addSubAdmin,
        listUsers,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}