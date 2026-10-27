"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  productApi,
  ProductItem,
  ProductStatus,
} from "@/lib/productApi";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  LuArrowLeft,
  LuPencil,
  LuTrash2,
  LuCalendar,
  LuTruck,
  LuBuilding2,
  LuTag,
  LuRefreshCw,
  LuCircleAlert,
  LuClock,
  LuImage,
  LuImages,
} from "react-icons/lu";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProductDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let active = true;

    productApi
      .getBySlugOrId(id)
      .then((data) => {
        if (active) {
          setProduct(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Unable to load product details.";
          setError(msg);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await productApi.delete(product._id);
      router.push("/admin/products");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete product.";
      setError(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        );
      case "pre":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pre-Order
          </span>
        );
      case "featured":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <span className="size-1.5 rounded-full bg-purple-500" />
            Featured
          </span>
        );
      case "hidden":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span className="size-1.5 rounded-full bg-neutral-400" />
            Hidden
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <LuRefreshCw className="size-6 animate-spin text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-500 font-medium">
          Loading product...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <LuCircleAlert className="size-6" />
        </div>
        <h2 className="text-sm font-semibold text-neutral-900">
          Product Not Found
        </h2>
        <p className="text-xs text-neutral-500">
          {error || "The requested product does not exist or may have been removed."}
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

  const discount =
    product.regularPrice > product.salePrice
      ? Math.round(
          ((product.regularPrice - product.salePrice) / product.regularPrice) *
            100
        )
      : null;

  const totalStock = (product.color || []).reduce(
    (acc, c) => acc + (Number(c.stock) || 0),
    0
  );

  const gallaryImages = product.gallary || product.gallery || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <LuArrowLeft className="size-3.5" />
            <span>Back to Products</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
              {product.name}
            </h1>
            {getStatusBadge(product.status)}
          </div>
          <p className="text-xs font-mono text-neutral-400 mt-0.5">
            /{product.slug} • ID: {product._id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${product._id}/edit`}>
            <Button
              size="sm"
              className="rounded-xl h-8.5 text-xs gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer shadow-xs"
            >
              <LuPencil className="size-3.5" />
              <span>Edit</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl h-8.5 text-xs gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 cursor-pointer"
          >
            <LuTrash2 className="size-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Product Imagery Showcase */}
          <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Product Imagery
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Visual assets uploaded via Cloudinary.
                </p>
              </div>
              <span className="text-[11px] font-medium text-neutral-500">
                {gallaryImages.length} gallery {gallaryImages.length === 1 ? "image" : "images"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
              {/* Featured Image */}
              <div className="sm:col-span-2 space-y-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Featured Image (4:3)
                </span>
                {product.featuredImage ? (
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-xs">
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full rounded-xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-center p-4">
                    <LuImage className="size-8 text-neutral-300 mb-1" />
                    <span className="text-xs text-neutral-400">No featured image</span>
                  </div>
                )}
              </div>

              {/* Gallery Images (up to 3) */}
              <div className="sm:col-span-3 space-y-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Gallery Showcase ({gallaryImages.length}/3)
                </span>
                {gallaryImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2.5">
                    {gallaryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-xs group"
                      >
                        <Image
                          src={img}
                          alt={`Gallery photo ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 33vw, 150px"
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono font-medium bg-neutral-900/80 text-white px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[3/1] rounded-xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-center p-4">
                    <LuImages className="size-6 text-neutral-300 mb-1" />
                    <span className="text-xs text-neutral-400">No gallery images added</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Overview */}
          <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Pricing
            </h2>
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                  ৳{(product.salePrice ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 ml-1.5">Sale Price</span>
              </div>

              {product.regularPrice > product.salePrice && (
                <div className="flex items-center gap-2">
                  <span className="text-sm line-through text-neutral-400 font-medium">
                    ৳{(product.regularPrice ?? 0).toLocaleString()}
                  </span>
                  {discount && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      Save {discount}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Color & Stock Inventory */}
          <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Color Variants & Stock
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Available variants and stock levels.
                </p>
              </div>
              <div className="text-xs font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg">
                Total Units: {totalStock}
              </div>
            </div>

            <div className="divide-y divide-neutral-100">
              {(product.color || []).map((c, index) => {
                const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(c.value);
                return (
                  <div
                    key={c._id || index}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-5 rounded-full border border-neutral-300 shadow-xs"
                        style={{
                          backgroundColor: isHex ? c.value : "#888888",
                        }}
                      />
                      <span className="font-mono text-neutral-800 font-medium">
                        {c.value}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-950">
                        {c.stock} units
                      </span>
                      {c.stock === 0 ? (
                        <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded font-medium">
                          Out of stock
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                          In stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-3">
            <h2 className="text-sm font-semibold text-neutral-950">
              Description
            </h2>
            <div className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pre-order Schedule */}
          {product.status === "pre" && product.preOrderDetails && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-subtle space-y-3.5">
              <div className="flex items-center gap-2 text-amber-900">
                <LuCalendar className="size-4 shrink-0 text-amber-700" />
                <h3 className="text-xs font-semibold">
                  Pre-Order Details
                </h3>
              </div>

              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-amber-800/80 text-[11px]">
                    Launch Date
                  </dt>
                  <dd className="font-medium text-amber-950 mt-0.5">
                    {product.preOrderDetails.launchDate &&
                    !isNaN(new Date(product.preOrderDetails.launchDate).getTime())
                      ? new Date(
                          product.preOrderDetails.launchDate
                        ).toLocaleDateString()
                      : "Pending"}
                  </dd>
                </div>

                <div>
                  <dt className="text-amber-800/80 text-[11px]">Lots Reserved</dt>
                  <dd className="font-medium text-amber-950 mt-0.5">
                    {product.preOrderDetails.fillLots || 0} /{" "}
                    {product.preOrderDetails.totalLots || 0}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Details */}
          <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 shadow-subtle space-y-4">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Logistics & Details
            </h2>

            <dl className="space-y-3.5 text-xs">
              <div>
                <dt className="text-neutral-400 font-medium text-[11px] flex items-center gap-1.5">
                  <LuTag className="size-3" />
                  Category
                </dt>
                <dd className="text-neutral-900 font-medium mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800">
                    {product.category}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-neutral-400 font-medium text-[11px] flex items-center gap-1.5">
                  <LuBuilding2 className="size-3" />
                  Importer
                </dt>
                <dd className="text-neutral-900 font-medium mt-1">
                  {product.Importer}
                </dd>
              </div>

              <div>
                <dt className="text-neutral-400 font-medium text-[11px] flex items-center gap-1.5">
                  <LuTruck className="size-3" />
                  Delivery
                </dt>
                <dd className="text-neutral-900 mt-1 leading-relaxed">
                  {product.deliveryHeading}
                </dd>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <dt className="text-neutral-400 font-medium text-[11px] flex items-center gap-1.5">
                  <LuClock className="size-3" />
                  Timestamps
                </dt>
                <dd className="text-[11px] text-neutral-500 mt-1 space-y-0.5 font-mono">
                  <div>
                    Created:{" "}
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "—"}
                  </div>
                  <div>
                    Updated:{" "}
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString()
                      : "—"}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-card p-6 shadow-xl space-y-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-1">
              <LuTrash2 className="size-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-950">
                Delete Product
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-neutral-900">
                  {product.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl text-xs h-8.5 border-neutral-200"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl text-xs h-8.5 bg-destructive text-white hover:bg-destructive/90 gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <LuRefreshCw className="size-3 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
