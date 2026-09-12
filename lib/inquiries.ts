import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, increment } from "firebase/firestore";
import { db } from "./firebase";
import { Inquiry } from "./types";

const COLLECTION = "inquiries";

export async function submitInquiry(inquiry: Omit<Inquiry, "id" | "status" | "createdAt">) {
  // Save inquiry
  await addDoc(collection(db, COLLECTION), {
    ...inquiry,
    status: "new",
    createdAt: new Date().toISOString(),
  });

  // Increment car inquiry count
  const carRef = doc(db, "cars", inquiry.carId);
  await updateDoc(carRef, { inquiryCount: increment(1) });
}

export async function getInquiries(): Promise<Inquiry[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
}

export async function updateInquiryStatus(id: string, status: Inquiry["status"]) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status });
}
