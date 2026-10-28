import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Product } from "@/data/products";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ProductDetailsView } from "@/components/products/ProductDetailsView";
import { LuArrowLeft, LuPackageSearch } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/productApi";
import { adaptProductItem } from "@/lib/productAdapter";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function resolveProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const apiProduct = await productApi.getBySlugOrId(idOrSlug);
    if (apiProduct && apiProduct._id) {
      return adaptProductItem(apiProduct);
    }
  } catch (err) {
    console.error(`Failed to resolve product [${idOrSlug}]:`, err);
  }

  return null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await resolveProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | UniqueHub",
      description: "The requested product is not available in our catalog.",
    };
  }

  return {
    title: `${product.name} | UniqueHub BD`,
    description: `${product.description?.slice(0, 150) || product.name} Curated cross-border imports delivered to Bangladesh with all customs clearance included.`,
    keywords: [
      product.name,
      product.category,
      "UniqueHub BD",
      "Bangladeshi cross-border shopping",
      "customs cleared pre-order",
    ],
    openGraph: {
      title: `${product.name} - UniqueHub`,
      description: product.description?.slice(0, 150) || product.name,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await resolveProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 mb-4">
              <LuPackageSearch className="size-8" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              Product Not Found
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              The product you are looking for does not exist or has been removed
              from our current collection.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/products">
                <Button className="rounded-xl bg-neutral-900 text-white text-xs gap-2">
                  <LuArrowLeft className="size-4" />
                  <span>Browse All Products</span>
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch real related products from server endpoint
  const relatedRaw = await productApi.getRelated(
    product.category,
    product.id,
    4
  );
  const relatedProducts = relatedRaw.map(adaptProductItem);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <ProductDetailsView
          product={product}
          relatedProducts={relatedProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
