"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CarForm from "@/components/admin/CarForm";
import { addCar } from "@/lib/cars";

function generateSlug(brand: string, model: string, year: number | string): string {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function NewCarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const slug = generateSlug(data.brand, data.model, data.year);
      const id = await addCar({
        ...data,
        slug,
        createdBy: "admin",
        viewCount: 0,
        inquiryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.status === "published" ? { publishedAt: new Date().toISOString() } : {}),
      });
      router.push(`/admin/cars/${id}/edit`);
    } catch (err) {
      console.error(err);
      alert("Failed to save unit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Inventory</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">Add New Unit</h1>
      </div>

      <div className="bg-white border border-gray-200 p-8">
        <CarForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
