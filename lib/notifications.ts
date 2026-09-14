import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { PartnerNotification } from "./types";

const COLLECTION = "notifications";

export async function addNotification(
  partnerId: string,
  type: "published" | "sold",
  carId: string,
  carTitle: string,
  message: string
): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    partnerId,
    type,
    carId,
    carTitle,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function getNotificationsForPartner(
  partnerId: string
): Promise<PartnerNotification[]> {
  const q = query(
    collection(db, COLLECTION),
    where("partnerId", "==", partnerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerNotification));
}

export async function markAllNotificationsRead(partnerId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where("partnerId", "==", partnerId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(doc(db, COLLECTION, d.id), { read: true }));
  await batch.commit();
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { read: true });
}
