import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  limit,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Car } from "./types";

const COLLECTION = "cars";

export async function getCars(filters?: {
  status?: string;
  brand?: string;
  carType?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Car[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  let cars = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Car));

  if (filters?.status) cars = cars.filter((c) => c.status === filters.status);
  if (filters?.brand) cars = cars.filter((c) => c.brand === filters.brand);
  if (filters?.carType) cars = cars.filter((c) => c.carType === filters.carType);
  if (filters?.minPrice) cars = cars.filter((c) => c.sellingPrice >= filters.minPrice!);
  if (filters?.maxPrice && filters.maxPrice !== Infinity)
    cars = cars.filter((c) => c.sellingPrice <= filters.maxPrice!);

  return cars;
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const q = query(collection(db, COLLECTION), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Car;
}

export async function getMostViewedCars(count = 6): Promise<Car[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "published"),
    orderBy("viewCount", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Car));
}

export async function incrementViewCount(carId: string) {
  const ref = doc(db, COLLECTION, carId);
  await updateDoc(ref, { viewCount: increment(1) });
}

export async function addCar(car: Omit<Car, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...car,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0,
    inquiryCount: 0,
  });
  return ref.id;
}

export async function updateCar(id: string, data: Partial<Car>) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function logCarActivity(id: string, action: string, detail?: string) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    activityLog: arrayUnion({ action, detail: detail ?? "", at: new Date().toISOString() }),
  });
}

export async function getCarById(id: string): Promise<Car | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Car;
}
