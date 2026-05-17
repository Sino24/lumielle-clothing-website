// src/data/db.ts
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all product data.
// Import from here in: Home.tsx, Products.tsx, ProductDetail.tsx
// When you get a real DB / API, replace this file only.
// ─────────────────────────────────────────────────────────────────────────────

import t1Image from "../assets/blackt.png";
import t2Image from "../assets/brownt.png";
import t3Image from "../assets/whitet.png";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string | null;
  img: string;           // primary thumbnail (used on cards)
  images: string[];      // 4 gallery images (used on detail page)
  category: string;
  colors: {
    label: string;
    hex: string;
  }[];
  sizes: string[];
  description: string;
  details: string[];
  careInstructions: string[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
export const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Obsidian Classic Tee",
    price: "₹1,200",
    badge: "New",
    img: t1Image,
    images: [t1Image, t2Image, t3Image, t1Image],
    category: "Classic",
    colors: [
      { label: "Obsidian", hex: "#1a1a1a" },
      { label: "Umber",    hex: "#4a3728" },
      { label: "Ivory",    hex: "#f5f0eb" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "A pitch-dark essential built for those who speak in restraint. Cut from 100% supima cotton, the Obsidian Classic drapes without clinging — effortless from morning to midnight.",
    details: [
      "100% Supima Cotton",
      "240 GSM fabric weight",
      "Relaxed regular fit",
      "Ribbed crew neck",
      "Double-stitched hem",
      "Made in India",
    ],
    careInstructions: [
      "Machine wash cold, gentle cycle",
      "Do not bleach",
      "Tumble dry low",
      "Iron on low heat",
      "Do not dry clean",
    ],
  },
  {
    id: 2,
    name: "Umber Relaxed Tee",
    price: "₹1,200",
    badge: null,
    img: t2Image,
    images: [t2Image, t1Image, t3Image, t2Image],
    category: "Relaxed",
    colors: [
      { label: "Umber",    hex: "#4a3728" },
      { label: "Obsidian", hex: "#1a1a1a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Warm earth tones meet an unhurried silhouette. The Umber Relaxed is woven for the in-between hours — slow mornings, café afternoons, and everything that follows.",
    details: [
      "100% Organic Cotton",
      "220 GSM fabric weight",
      "Oversized relaxed fit",
      "Dropped shoulders",
      "Garment-dyed finish",
      "Made in India",
    ],
    careInstructions: [
      "Hand wash or gentle machine wash",
      "Wash with similar colours",
      "Do not wring",
      "Dry flat in shade",
      "Cool iron if needed",
    ],
  },
  {
    id: 3,
    name: "Ivory Minimal Tee",
    price: "₹1,200",
    badge: "Best Seller",
    img: t3Image,
    images: [t3Image, t1Image, t2Image, t3Image],
    category: "Classic",
    colors: [
      { label: "Ivory",    hex: "#f5f0eb" },
      { label: "Obsidian", hex: "#1a1a1a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "The one you reach for without thinking. Ivory-white, perfectly weighted, with a neckline that sits just right. Our bestseller for a reason — it simply works.",
    details: [
      "100% Pima Cotton",
      "200 GSM fabric weight",
      "Classic regular fit",
      "Reinforced collar",
      "Pre-shrunk fabric",
      "Made in India",
    ],
    careInstructions: [
      "Machine wash cold",
      "Wash separately first wear",
      "Do not bleach",
      "Tumble dry low",
      "Warm iron",
    ],
  },
  {
    id: 4,
    name: "Charcoal Slim Tee",
    price: "₹1,400",
    originalPrice: "₹1,600",
    badge: "Sale",
    img: t1Image,
    images: [t1Image, t3Image, t2Image, t1Image],
    category: "Slim Fit",
    colors: [
      { label: "Charcoal", hex: "#3a3a3a" },
      { label: "Ivory",    hex: "#f5f0eb" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Tailored closer to the body, the Charcoal Slim is precision in fabric form. Structured enough for the boardroom, relaxed enough for everything else.",
    details: [
      "95% Cotton, 5% Elastane",
      "230 GSM fabric weight",
      "Slim tailored fit",
      "Stretch-comfort weave",
      "Side-seam construction",
      "Made in India",
    ],
    careInstructions: [
      "Machine wash 30°C",
      "Do not tumble dry",
      "Do not bleach",
      "Iron on reverse side",
      "Do not dry clean",
    ],
  },
  {
    id: 5,
    name: "Mocha Oversized Tee",
    price: "₹1,350",
    badge: null,
    img: t2Image,
    images: [t2Image, t3Image, t1Image, t2Image],
    category: "Oversized",
    colors: [
      { label: "Mocha",    hex: "#6b4f3a" },
      { label: "Obsidian", hex: "#1a1a1a" },
      { label: "Ivory",    hex: "#f5f0eb" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Drape yourself in warmth. The Mocha Oversized is cut wide, long, and generous — a hug in fabric form with a rich brown that deepens in any light.",
    details: [
      "100% Cotton Terry",
      "260 GSM fabric weight",
      "Boxy oversized fit",
      "Extended hem length",
      "Raw-edge sleeves",
      "Made in India",
    ],
    careInstructions: [
      "Machine wash cold",
      "Wash inside out",
      "Do not bleach",
      "Tumble dry low",
      "Do not iron print",
    ],
  },
  {
    id: 6,
    name: "Pearl Drop Shoulder",
    price: "₹1,500",
    badge: "New",
    img: t3Image,
    images: [t3Image, t2Image, t1Image, t3Image],
    category: "Oversized",
    colors: [
      { label: "Pearl", hex: "#f5f0eb" },
      { label: "Umber", hex: "#4a3728" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "The drop shoulder is back — not as a trend, but as a statement. Pearl-white with a fall that drapes beautifully, the Pearl DS is your new weekend uniform.",
    details: [
      "100% Egyptian Cotton",
      "250 GSM fabric weight",
      "Drop-shoulder fit",
      "Elongated back hem",
      "Enzyme-washed finish",
      "Made in India",
    ],
    careInstructions: [
      "Gentle machine wash",
      "Cold water only",
      "Do not tumble dry",
      "Dry flat in shade",
      "Low heat iron",
    ],
  },
  {
    id: 7,
    name: "Midnight Boxy Tee",
    price: "₹1,300",
    badge: null,
    img: t1Image,
    images: [t1Image, t2Image, t3Image, t1Image],
    category: "Relaxed",
    colors: [
      { label: "Midnight", hex: "#0d0d0d" },
      { label: "Ivory",    hex: "#f5f0eb" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Near-black with a boxy cut that refuses to follow rules. The Midnight Boxy is for those who prefer their clothes to say nothing — and everything — at once.",
    details: [
      "100% Cotton Slub",
      "220 GSM fabric weight",
      "Boxy relaxed fit",
      "Subtle texture slub yarn",
      "Washed for softness",
      "Made in India",
    ],
    careInstructions: [
      "Machine wash cold",
      "Gentle cycle only",
      "Do not bleach",
      "Lay flat to dry",
      "Steam or iron low",
    ],
  },
  {
    id: 8,
    name: "Espresso Crew Tee",
    price: "₹1,200",
    badge: null,
    img: t2Image,
    images: [t2Image, t1Image, t3Image, t2Image],
    category: "Classic",
    colors: [
      { label: "Espresso", hex: "#3b2314" },
      { label: "Ivory",    hex: "#f5f0eb" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description:
      "Rich, dark, and dependable — like your first coffee. The Espresso Crew is a wardrobe anchor in a deep brown that pairs with everything you already own.",
    details: [
      "100% Ring-Spun Cotton",
      "210 GSM fabric weight",
      "Classic crew fit",
      "Set-in sleeves",
      "Taped neck and shoulders",
      "Made in India",
    ],
    careInstructions: [
      "Machine wash 40°C",
      "Do not bleach",
      "Tumble dry medium",
      "Iron medium heat",
      "Do not dry clean",
    ],
  },
  {
    id: 9,
    name: "Linen White Essential",
    price: "₹1,150",
    originalPrice: "₹1,300",
    badge: "Sale",
    img: t3Image,
    images: [t3Image, t1Image, t2Image, t3Image],
    category: "Slim Fit",
    colors: [
      { label: "Linen White", hex: "#faf6f1" },
      { label: "Obsidian",    hex: "#1a1a1a" },
      { label: "Umber",       hex: "#4a3728" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Where cotton meets linen in perfect harmony. Lightweight, breathable, and naturally textured — the Linen White is your summer essential, now at its best price.",
    details: [
      "55% Cotton, 45% Linen",
      "180 GSM fabric weight",
      "Slim relaxed fit",
      "Natural linen texture",
      "Breathable open weave",
      "Made in India",
    ],
    careInstructions: [
      "Hand wash preferred",
      "Machine wash delicate 30°C",
      "Do not tumble dry",
      "Dry flat",
      "Iron slightly damp",
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get a single product by id */
export function getProductById(id: number): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

/** Get featured products for Home page */
export function getFeaturedProducts(count = 3): Product[] {
  return ALL_PRODUCTS.slice(0, count);
}

/** Get related products — same category, exclude self */
export function getRelatedProducts(id: number, count = 3): Product[] {
  const product = getProductById(id);
  if (!product) return [];
  return ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== id
  ).slice(0, count);
}

export const CATEGORIES = ["All", "Classic", "Relaxed", "Slim Fit", "Oversized"];
export const ITEMS_PER_PAGE = 9;