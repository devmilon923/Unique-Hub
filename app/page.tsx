import React from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { PreOrderSection } from "@/components/sections/PreOrderSection";
import { FeaturedSection } from "@/components/sections/FeaturedSection";
import { AllProductsSection } from "@/components/sections/AllProductsSection";
import { HowWeCollectSection } from "@/components/sections/HowWeCollectSection";
import { Footer } from "@/components/sections/Footer";
import { productApi } from "@/lib/productApi";
import { adaptProductItem } from "@/lib/productAdapter";
import { Product } from "@/data/products";

// Next.js 16 runtime route configuration for live API data fetching
export const instant = false;

async function getHomepageProducts(): Promise<Product[]> {
  try {
    const res = await productApi.getAll({ limit: 50 });
    if (res?.result && res.result.length > 0) {
      return res.result
        .filter((item) => item.status !== "hidden")
        .map(adaptProductItem);
    }
  } catch (err) {
    console.error("Failed to fetch products from backend API:", err);
  }
  return [];
}

export default async function Home() {
  const allProducts = await getHomepageProducts();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Sticky Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Pre-Order Products */}
        <PreOrderSection products={allProducts} />

        {/* 3. Featured Products */}
        <FeaturedSection products={allProducts} />

        {/* 4. Handpicked Collection */}
        <AllProductsSection products={allProducts} />

        {/* 5. How We Collect Product Section */}
        <HowWeCollectSection />
      </main>

      {/* 6. Footer with Contact Info */}
      <Footer />
    </div>
  );
}
