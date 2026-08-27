import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAhqwu4twxHl77CTa2i-gyte0IIshpv7K8",
  authDomain: "balbali-store-3aec4.firebaseapp.com",
  projectId: "balbali-store-3aec4",
  storageBucket: "balbali-store-3aec4.firebasestorage.app",
  messagingSenderId: "302276729585",
  appId: "1:302276729585:web:31f7072065b8205bb1a750"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only works in the browser, and isSupported() avoids
// a crash during SSR/build — safe to leave in even if unused for now.
export let analytics = null;
isSupported().then((ok) => {
  if (ok) analytics = getAnalytics(app);
});
