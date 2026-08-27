// Data module for UI browsing and filtering.
// Each product is standalone with dedicated photo assets imported directly.

import { Smartphone, Shield, Cable, Headphones, Wrench } from "lucide-react";

// ---- Real photo imports ----
import heroImg from "../assets/hero.png";
import phone1 from "../assets/phone1.jpg";
import phone2 from "../assets/phone2.jpg";
import coque1 from "../assets/coque1.jpeg";
import coque2 from "../assets/coque2.jpeg";
import cable1 from "../assets/cable1.jpeg";
import cable2 from "../assets/cable2.jpeg";
import charger1 from "../assets/charger1.jpeg";
import accessoire from "../assets/accessoire.jpeg";

export const categories = [
  { id: "phones", name: "Téléphones", icon: Smartphone },
  { id: "cases", name: "Coques", icon: Shield },
  { id: "chargers", name: "Chargeurs et Câbles", icon: Cable },
  { id: "audio", name: "Audio", icon: Headphones },
  { id: "accessories", name: "Accessoires", icon: Wrench },
];

export const products = [
  {
    id: "p1",
    name: "iPhone 14 Silicone Case",
    sku: "0231",
    price: 35,
    oldPrice: 45,
    discountPercent: 22,
    category: "cases",
    badges: ["NEW"],
    inStock: true,
    images: [coque1, coque2],
    description: "Coque en silicone toucher doux avec doublure en microfibre pour iPhone 14.",
    tags: { newArrival: true, promotion: true, bestSeller: false, featured: false },
  },
  {
    id: "p1b",
    name: "iPhone 13 Silicone Case",
    sku: "0232",
    price: 33,
    category: "cases",
    badges: [],
    inStock: true,
    images: [coque2, coque1],
    description: "Coque en silicone toucher doux avec doublure en microfibre pour iPhone 13.",
    tags: { newArrival: false, promotion: false, bestSeller: false, featured: false },
  },
  {
    id: "p2",
    name: "USB-C Fast Charger 20W",
    sku: "0455",
    price: 45,
    category: "chargers",
    badges: ["HOT"],
    inStock: true,
    images: [charger1, cable1],
    description: "Chargeur rapide USB-C PD 20W, compatible avec la plupart des téléphones modernes.",
    tags: { newArrival: false, promotion: false, bestSeller: true, featured: true },
  },
  {
    id: "p3",
    name: "Wireless Earbuds Pro",
    sku: "0781",
    price: 120,
    oldPrice: 150,
    discountPercent: 20,
    category: "audio",
    badges: ["NEW"],
    inStock: true,
    images: [accessoire, heroImg],
    description: "Écouteurs sans fil Bluetooth 5.3 avec réduction active du bruit.",
    tags: { newArrival: true, promotion: true, bestSeller: true, featured: true },
  },
  {
    id: "p4",
    name: "Tempered Glass Screen Protector — iPhone 14",
    sku: "0110",
    price: 15,
    category: "accessories",
    badges: [],
    inStock: true,
    images: [accessoire, coque1],
    description: "Verre trempé 9H, compatible avec les coques, installation facile sans bulles.",
    tags: { newArrival: true, promotion: false, bestSeller: false, featured: false },
  },
  {
    id: "p4b",
    name: "Tempered Glass Screen Protector — Samsung S23",
    sku: "0111",
    price: 15,
    category: "accessories",
    badges: [],
    inStock: true,
    images: [accessoire, coque2],
    description: "Verre trempé 9H, compatible avec les coques, installation facile sans bulles.",
    tags: { newArrival: false, promotion: false, bestSeller: false, featured: false },
  },
  {
    id: "p5",
    name: "Samsung Galaxy A54",
    sku: "0999",
    price: 890,
    category: "phones",
    badges: ["HOT"],
    inStock: true,
    images: [phone1, phone2],
    description: "Écran Super AMOLED 6,4 pouces, stockage 128 Go, 5G.",
    tags: { newArrival: false, promotion: false, bestSeller: true, featured: true },
  },
  {
    id: "p6",
    name: "Magnetic Car Phone Mount",
    sku: "0322",
    price: 28,
    category: "accessories",
    badges: [],
    inStock: true,
    images: [accessoire, cable2],
    description: "Support magnétique puissant pour tableau de bord ou grille d'aération.",
    tags: { newArrival: false, promotion: false, bestSeller: true, featured: false },
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId) {
  return products.filter((p) => p.category === categoryId);
}

export function searchProducts(query, categoryId) {
  const q = (query || "").trim().toLowerCase();
  return products.filter((p) => {
    const matchesQuery =
      !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCategory = !categoryId || p.category === categoryId;
    return matchesQuery && matchesCategory;
  });
}

export function getCategoryImage(categoryId) {
  const firstProduct = products.find((p) => p.category === categoryId);
  return firstProduct?.images?.[0] || null;
}

export function getCategoryImages(categoryId) {
  return products
    .filter((p) => p.category === categoryId)
    .map((p) => p.images?.[0])
    .filter(Boolean);
}