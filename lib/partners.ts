import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
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
