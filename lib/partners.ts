import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Partner } from "./types";

const COLLECTION = "partners";

export async function getPartners(): Promise<Partner[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Partner));
}

export async function addPartner(
  data: Omit<Partner, "id" | "createdAt" | "uid">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    uid: "",
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updatePartner(id: string, data: Partial<Partner>): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data });
}

export async function getPartnerByUid(uid: string): Promise<Partner | null> {
  const q = query(collection(db, COLLECTION), where("uid", "==", uid), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Partner;
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Partner;
}
