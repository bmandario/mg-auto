import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDnqJSFiOAubJRl95pmK0tuB6Af5Q8JnA",
  authDomain: "mg-auto-f0925.firebaseapp.com",
  projectId: "mg-auto-f0925",
  storageBucket: "mg-auto-f0925.firebasestorage.app",
  messagingSenderId: "571687958241",
  appId: "1:571687958241:web:db0b23e55e5ff2e78129a0",
  measurementId: "G-ZQEG91S7HX",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
