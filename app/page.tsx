import React from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { PreOrderSection } from "@/components/sections/PreOrderSection";
import { FeaturedSection } from "@/components/sections/FeaturedSection";
import { AllProductsSection } from "@/components/sections/AllProductsSection";
import { HowWeCollectSection } from "@/components/sections/HowWeCollectSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Sticky Navigation */}
      <Navbar />

      <main className="flex-1 ">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Pre-Order Product */}
        <PreOrderSection />

        {/* 3. Features Product (Featured) */}
        <FeaturedSection />

        {/* 4. All Product with Category Filter, Search, and See More Button */}
        <AllProductsSection />

        {/* 5. How We Collect Product Section */}
        <HowWeCollectSection />
      </main>

      {/* 6. Footer with Contact Info */}
      <Footer />
    </div>
  );
}
