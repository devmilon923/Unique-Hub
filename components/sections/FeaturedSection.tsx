import React from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { LuArrowRight } from "react-icons/lu";

interface FeaturedSectionProps {
  products?: Product[];
}

export function FeaturedSection({ products = [] }: FeaturedSectionProps) {
  const featured = products.filter(
    (item) => item.isFeatured || item.status === "featured"
  );

  const displayList = featured.length > 0 ? featured : products.slice(0, 4);

  if (displayList.length === 0) {
    return null;
  }

  return (
    <section
      id="featured"
      className="py-16 sm:py-24 bg-white border-b border-border scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Harmonized Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked selections tested for craftsmanship, performance, and everyday utility.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center text-sm font-medium text-foreground hover:text-blue-bell-600 transition-colors duration-150 cursor-pointer"
          >
            <span>View All</span>
            <LuArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Clean Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {displayList.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
