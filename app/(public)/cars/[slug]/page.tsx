import { getCarBySlug, getCars } from "@/lib/cars";
import { notFound } from "next/navigation";
import { Car } from "@/lib/types";
import CarDetailClient from "./CarDetailClient";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const cars = await getCars({ status: "published" });
    return cars.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const car = await getCarBySlug(slug);
    if (!car) return { title: "Car Not Found | MG Auto" };
    return {
      title: `${car.year} ${car.brand} ${car.model} | MG Auto`,
      description: `${car.year} ${car.brand} ${car.model} for sale at ₱${car.sellingPrice.toLocaleString("en-PH")}. ${car.mileage.toLocaleString()} km, ${car.transmission}, ${car.fuelType}.`,
    };
  } catch {
    return { title: "MG Auto" };
  }
}

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let car;
  try {
    car = await getCarBySlug(slug);
  } catch {
    car = null;
  }

  if (!car) notFound();

  let relatedCars: Car[] = [];
  try {
    const all = await getCars({ status: "published" });
    relatedCars = all
      .filter((c) => c.id !== car!.id && (c.brand === car!.brand || c.carType === car!.carType))
      .slice(0, 4);
    if (relatedCars.length < 2) {
      relatedCars = all.filter((c) => c.id !== car!.id).slice(0, 4);
    }
  } catch {
    relatedCars = [];
  }

  return <CarDetailClient car={car} relatedCars={relatedCars} />;
}
