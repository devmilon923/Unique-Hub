"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  productApi,
  ProductItem,
  CreateProductInput,
} from "@/lib/productApi";
import { Button } from "@/components/ui/button";
import { LuRefreshCw, LuCircleAlert, LuArrowLeft } from "react-icons/lu";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    productApi
      .getBySlugOrId(id)
      .then((data) => {
        if (active) {
          setProduct(data);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Unable to load product for editing.";
          setLoadError(msg);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await productApi.update(id, data);
      router.push(`/admin/products/${id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update product. Please check form values.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <LuRefreshCw className="size-6 animate-spin text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-500 font-medium">
          Loading product specifications...
        </p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <LuCircleAlert className="size-6" />
        </div>
        <h2 className="text-sm font-semibold text-neutral-900">
          Product Not Found
        </h2>
        <p className="text-xs text-neutral-500">
          {loadError || "The product you are trying to edit could not be found."}
        </p>
        <Link href="/admin/products">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs border-neutral-200"
          >
            <LuArrowLeft className="size-3.5 mr-1.5" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
          Edit Product
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Modifying &ldquo;{product.name}&rdquo; ({product.slug})
        </p>
      </div>

      <ProductForm
        initialData={product}
        isEditing={true}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </div>
  );
}
