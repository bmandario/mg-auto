import { collection, doc, getDoc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "admins";

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return snap.exists();
}

export async function getAdmins(): Promise<{ uid: string; email: string; createdAt: string }[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as { uid: string; email: string; createdAt: string }));
}

export async function addAdmin(uid: string, email: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), { email, createdAt: new Date().toISOString() });
}

export async function removeAdmin(uid: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, uid));
}
