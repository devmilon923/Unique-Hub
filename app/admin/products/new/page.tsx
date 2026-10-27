"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { productApi, CreateProductInput } from "@/lib/productApi";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await productApi.create(data);
      router.push(`/admin/products/${created._id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to create product. Please verify fields.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
          Add New Product
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Create a new product in the store catalog.
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
