export type CarStatus = "draft" | "published" | "unpublished" | "sold";
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

export type DiagnosisStatus = "ok" | "attention" | "critical";

export interface DiagnosisItem {
  name: string;
  status: DiagnosisStatus;
  notes: string;
}

export interface DiagnosisCategory {
  category: string;
  items: DiagnosisItem[];
}

export interface Diagnosis {
  date: string;
  technician: string;
  overallStatus: DiagnosisStatus;
  categories: DiagnosisCategory[];
  notes: string;
}

export const DIAGNOSIS_DEFAULTS: DiagnosisCategory[] = [
  {
    category: "Engine",
    items: [
      { name: "Engine Oil Level", status: "ok", notes: "" },
      { name: "Coolant Level", status: "ok", notes: "" },
      { name: "Air Filter", status: "ok", notes: "" },
      { name: "Drive Belts", status: "ok", notes: "" },
      { name: "Spark Plugs / Glow Plugs", status: "ok", notes: "" },
    ],
  },
  {
    category: "Transmission",
    items: [
      { name: "Fluid Level", status: "ok", notes: "" },
      { name: "Gear Shifting", status: "ok", notes: "" },
      { name: "Clutch Condition", status: "ok", notes: "" },
    ],
  },
  {
    category: "Brakes",
    items: [
      { name: "Front Brake Pads", status: "ok", notes: "" },
      { name: "Rear Brake Pads", status: "ok", notes: "" },
      { name: "Brake Rotors", status: "ok", notes: "" },
      { name: "Brake Fluid", status: "ok", notes: "" },
      { name: "Handbrake", status: "ok", notes: "" },
    ],
  },
  {
    category: "Suspension & Steering",
    items: [
      { name: "Shock Absorbers", status: "ok", notes: "" },
      { name: "Ball Joints", status: "ok", notes: "" },
      { name: "Tie Rod Ends", status: "ok", notes: "" },
      { name: "CV Axle / Drive Shaft", status: "ok", notes: "" },
    ],
  },
  {
    category: "Electrical",
    items: [
      { name: "Battery", status: "ok", notes: "" },
      { name: "Alternator", status: "ok", notes: "" },
      { name: "Headlights & Taillights", status: "ok", notes: "" },
      { name: "Dashboard Warning Lights", status: "ok", notes: "" },
    ],
  },
  {
    category: "Body & Exterior",
    items: [
      { name: "Paint Condition", status: "ok", notes: "" },
      { name: "Panel Alignment", status: "ok", notes: "" },
      { name: "Glass & Windshield", status: "ok", notes: "" },
      { name: "Rust / Corrosion", status: "ok", notes: "" },
    ],
  },
  {
    category: "Interior",
    items: [
      { name: "AC System", status: "ok", notes: "" },
      { name: "Dashboard Electronics", status: "ok", notes: "" },
      { name: "Seat Condition", status: "ok", notes: "" },
      { name: "Odometer", status: "ok", notes: "" },
    ],
  },
  {
    category: "Tires & Wheels",
    items: [
      { name: "Tread Depth", status: "ok", notes: "" },
      { name: "Tire Pressure", status: "ok", notes: "" },
      { name: "Wheel Alignment", status: "ok", notes: "" },
      { name: "Spare Tire", status: "ok", notes: "" },
    ],
  },
];

export interface Financing {
  available: boolean;
  estimatedDownPayment: number;
  terms: FinancingTerm[];
  requiredSalary: number;
  notes?: string;
}

export interface ActivityEntry {
  action: string;
  detail?: string;
  at: string; // ISO date string
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
  diagnosis?: Diagnosis;
  slug: string;
  activityLog?: ActivityEntry[];
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
