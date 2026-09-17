"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateCar, logCarActivity } from "@/lib/cars";
import { addNotification } from "@/lib/notifications";
import { Car } from "@/lib/types";
import CarForm from "@/components/admin/CarForm";

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const snap = await getDoc(doc(db, "cars", id));
        if (snap.exists()) {
          setCar({ id: snap.id, ...snap.data() } as Car);
        } else {
          alert("Car not found.");
          router.push("/admin/cars");
        }
      } catch {
        alert("Failed to load car.");
        router.push("/admin/cars");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const isFirstPublish = data.status === "published" && !car?.publishedAt;
    const partnerChanged = data.partnerId && data.partnerId !== car?.partnerId;
    try {
      await updateCar(id, {
        ...data,
        updatedAt: new Date().toISOString(),
        ...(isFirstPublish ? { publishedAt: new Date().toISOString() } : {}),
      });
      if (isFirstPublish) {
        await logCarActivity(id, "Published to public listing");
        if (data.partnerId) {
          await addNotification(data.partnerId, "published", id, `${data.brand} ${data.model}`, `Your unit ${data.brand} ${data.model} is now live on the public listing.`);
        }
      }
      if (partnerChanged) {
        await addNotification(data.partnerId, "tagged", id, `${data.brand} ${data.model}`, `A unit has been tagged to you: ${data.brand} ${data.model} (${data.year}).`);
      }
      router.push("/admin/cars");
    } catch (err) {
      console.error(err);
      alert("Failed to update unit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) return null;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Inventory</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">
            EDIT UNIT — {car.brand} {car.model}
          </h1>
        </div>
        {car.slug && (
          <a
            href={`/cars/${car.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border border-[#1a2a1a] text-[#4caf50] px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[#4caf50] hover:text-white transition-colors mt-1"
          >
            ↗ Public View
          </a>
        )}
      </div>

      <div className="bg-white border border-gray-200 p-8">
        <CarForm initialData={car} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
