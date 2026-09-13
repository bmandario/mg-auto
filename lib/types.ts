export type CarStatus = "draft" | "available" | "sold";
export type RoadworthinessStatus = "pass" | "fail" | "pending";
export type FuelType = "Gasoline" | "Diesel" | "Hybrid" | "Electric";
export type Transmission = "Automatic" | "Manual" | "CVT";
export type CarType = "Sedan" | "SUV" | "Crossover" | "Van" | "Pickup Truck" | "Hatchback";

export interface CarPhoto {
  url: string;
  storagePath: string;
  isMain: boolean;
}

export interface ServiceRecord {
  id: string;
  date: string;
  service: string;
  mileage: number;
  notes: string;
  cost: number;
}

export interface PartReplaced {
  id: string;
  part: string;
  brand: string;
  date: string;
  cost: number;
}

export interface Roadworthiness {
  status: RoadworthinessStatus;
  expiryDate: string;
  notes: string;
}

export interface FinancingTerm {
  months: 12 | 24 | 36 | 48;
  monthlyAmortization: number;
}

export interface Financing {
  available: boolean;
  estimatedDownPayment: number;
  terms: FinancingTerm[];
  requiredSalary: number;
  notes?: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  fuelType: FuelType;
  transmission: Transmission;
  carType: CarType;
  engine: string;
  seats: number;
  driveType: string;
  description: string;
  status: CarStatus;
  photos: CarPhoto[];
  roadworthiness: Roadworthiness;
  serviceHistory: ServiceRecord[];
  partsReplaced: PartReplaced[];
  partnerCost: number;
  repairCost: number;
  recommendedPrice: number;
  sellingPrice: number;
  partnerId: string;
  partnerName: string;
  soldPrice?: number;
  soldDate?: string;
  paymentToPartner?: number;
  viewCount: number;
  inquiryCount: number;
  financing?: Financing;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Inquiry {
  id: string;
  carId: string;
  carTitle: string;
  carSlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "responded";
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  uid: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const CAR_BRANDS = [
  "Toyota", "Honda", "Mitsubishi", "Ford", "Hyundai",
  "Nissan", "Suzuki", "Isuzu", "Kia", "Mazda",
  "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Other",
];

export const CAR_TYPES: CarType[] = [
  "Sedan", "SUV", "Crossover", "Van", "Pickup Truck", "Hatchback",
];

export const PRICE_RANGES = [
  { label: "Under ₱300k", min: 0, max: 300000 },
  { label: "₱300k – ₱500k", min: 300000, max: 500000 },
  { label: "₱500k – ₱800k", min: 500000, max: 800000 },
  { label: "₱800k – ₱1.2M", min: 800000, max: 1200000 },
  { label: "₱1.2M – ₱2M", min: 1200000, max: 2000000 },
  { label: "Over ₱2M", min: 2000000, max: Infinity },
];
