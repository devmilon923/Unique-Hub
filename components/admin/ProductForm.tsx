"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ProductItem,
  CreateProductInput,
  ProductColor,
  ProductStatus,
} from "@/lib/productApi";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import {
  LuPlus,
  LuTrash2,
  LuCircleAlert,
  LuLoader,
  LuSparkles,
  LuArrowLeft,
  LuCalendar,
} from "react-icons/lu";

interface ProductFormProps {
  initialData?: Partial<ProductItem>;
  isEditing?: boolean;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

const CATEGORY_SUGGESTIONS = [
  "Electronics",
  "Accessories",
  "Audio",
  "Computing",
  "Smart Home",
  "Gadgets",
  "Wearables",
];

const STATUS_OPTIONS: { label: string; value: ProductStatus }[] = [
  { label: "Live", value: "live" },
  { label: "Pre-Order", value: "pre" },
  { label: "Featured", value: "featured" },
  { label: "Hidden (Draft)", value: "hidden" },
];

export function ProductForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting,
  error: externalError,
}: ProductFormProps) {
  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    Boolean(initialData?.slug)
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [importer, setImporter] = useState(
    initialData?.Importer || "Tech Imports Ltd."
  );
  const [deliveryHeading, setDeliveryHeading] = useState(
    initialData?.deliveryHeading || "Standard Delivery: 3-5 business days"
  );
  const [regularPrice, setRegularPrice] = useState(
    initialData?.regularPrice !== undefined ? String(initialData.regularPrice) : ""
  );
  const [salePrice, setSalePrice] = useState(
    initialData?.salePrice !== undefined ? String(initialData.salePrice) : ""
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialData?.status || "live"
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  // Imagery state
  const [featuredImage, setFeaturedImage] = useState<string>(
    initialData?.featuredImage || ""
  );
  const [gallary, setGallary] = useState<string[]>(() => {
    if (Array.isArray(initialData?.gallary) && initialData.gallary.length > 0) {
      return initialData.gallary;
    }
    if (Array.isArray(initialData?.gallery) && initialData.gallery.length > 0) {
      return initialData.gallery;
    }
    return [];
  });

  // Pre-order fields
  const [launchDate, setLaunchDate] = useState<string>(() => {
    if (initialData?.preOrderDetails?.launchDate) {
      const d = new Date(initialData.preOrderDetails.launchDate);
      return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
    }
    return "";
  });
  const [totalLots, setTotalLots] = useState(
    initialData?.preOrderDetails?.totalLots !== undefined
      ? String(initialData.preOrderDetails.totalLots)
      : "100"
  );

  // Colors & Stock
  const [colors, setColors] = useState<ProductColor[]>(() => {
    if (initialData?.color && initialData.color.length > 0) {
      return initialData.color.map((c) => ({
        value: c.value,
        stock: c.stock,
        _id: c._id,
      }));
    }
    return [
      { value: "#000000", stock: 50 },
      { value: "#FFFFFF", stock: 30 },
    ];
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSlugRegenerate = () => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
    setIsSlugManuallyEdited(false);
  };

  const addColorVariant = () => {
    setColors((prev) => [...prev, { value: "#1A1A1A", stock: 10 }]);
  };

  const updateColorVariant = (
    index: number,
    field: "value" | "stock",
    value: string | number
  ) => {
    setColors((prev) => {
      const next = [...prev];
      if (field === "stock") {
        next[index] = {
          ...next[index],
          stock: Math.max(0, parseInt(String(value), 10) || 0),
        };
      } else {
        next[index] = { ...next[index], value: String(value) };
      }
      return next;
    });
  };

  const removeColorVariant = (index: number) => {
    if (colors.length <= 1) {
      setValidationError("Product must have at least one color variant.");
      return;
    }
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Required fields check
    if (!name.trim()) {
      setValidationError("Product name is required.");
      return;
    }
    if (!slug.trim()) {
      setValidationError("URL slug is required.");
      return;
    }
    if (!category.trim()) {
      setValidationError("Category is required.");
      return;
    }
    if (!importer.trim()) {
      setValidationError("Importer is required.");
      return;
    }
    if (!deliveryHeading.trim()) {
      setValidationError("Delivery heading is required.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Description is required.");
      return;
    }

    const regPriceNum = Number(regularPrice);
    const salePriceNum = Number(salePrice);

    if (isNaN(regPriceNum) || regPriceNum <= 0) {
      setValidationError("Regular price must be greater than zero.");
      return;
    }
    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      setValidationError("Sale price must be greater than zero.");
      return;
    }
    if (salePriceNum > regPriceNum) {
      setValidationError("Sale price cannot be higher than regular price.");
      return;
    }

    if (colors.length === 0) {
      setValidationError("At least one color variant is required.");
      return;
    }

    for (let i = 0; i < colors.length; i++) {
      if (!colors[i].value.trim()) {
        setValidationError(`Color variant #${i + 1} is missing a color value.`);
        return;
      }
    }

    // Featured Image validation
    if (!featuredImage.trim()) {
      setValidationError(
        "Featured image is required. Please upload or provide a featured image."
      );
      return;
    }

    // Gallary validation (min 1, max 3)
    const validGallary = (gallary || []).map((g) => g.trim()).filter(Boolean);
    if (validGallary.length === 0) {
      setValidationError(
        "At least one gallery image is required. Please upload or provide a gallery image."
      );
      return;
    }
    if (validGallary.length > 3) {
      setValidationError("Maximum 3 gallery images allowed.");
      return;
    }

    // Pre-order requirements
    if (status === "pre") {
      if (!launchDate) {
        setValidationError("Launch date is required for pre-order products.");
        return;
      }
      const parsedDate = new Date(launchDate);
      if (isNaN(parsedDate.getTime())) {
        setValidationError("Please enter a valid launch date.");
        return;
      }

      const lotsNum = parseInt(totalLots, 10);
      if (isNaN(lotsNum) || lotsNum < 1) {
        setValidationError("Total lots must be at least 1.");
        return;
      }
    }

    const payload: CreateProductInput = {
      name: name.trim(),
      slug: slug.trim(),
      category: category.trim(),
      Importer: importer.trim(),
      deliveryHeading: deliveryHeading.trim(),
      regularPrice: regPriceNum,
      salePrice: salePriceNum,
      description: description.trim(),
      status,
      featuredImage: featuredImage.trim(),
      gallary: validGallary,
      gallery: validGallary,
      color: colors.map((c) => ({
        value: c.value.trim(),
        stock: Math.max(0, parseInt(String(c.stock), 10) || 0),
      })),
    };

    if (status === "pre") {
      payload.preOrderDetails = {
        launchDate: new Date(launchDate).toISOString(),
        totalLots: Math.max(1, parseInt(totalLots, 10) || 1),
        fillLots: initialData?.preOrderDetails?.fillLots || 0,
      };
    }

    await onSubmit(payload);
  };

  const activeError = validationError || externalError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <LuArrowLeft className="size-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
          <LuCircleAlert className="size-4 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Section 1: Product Information */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-semibold text-neutral-950">
            Product Information
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Basic identity and sourcing details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="prod-name"
              className="block text-xs font-medium text-neutral-700"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="prod-name"
              type="text"
              required
              placeholder="e.g. Mechanical Keyboard Pro 75%"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-xs h-9.5"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="prod-slug"
                className="block text-xs font-medium text-neutral-700"
              >
                URL Slug <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={handleSlugRegenerate}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <LuSparkles className="size-3" />
                <span>Sync with Name</span>
              </button>
            </div>
            <Input
              id="prod-slug"
              type="text"
              required
              placeholder="e.g. mechanical-keyboard-pro-75"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManuallyEdited(true);
              }}
              className="text-xs font-mono h-9.5"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label
              htmlFor="prod-category"
              className="block text-xs font-medium text-neutral-700"
            >
              Category <span className="text-destructive">*</span>
            </label>
            <Input
              id="prod-category"
              type="text"
              required
              placeholder="e.g. Electronics"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs h-9.5"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    category === cat
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Importer */}
          <div className="space-y-1.5">
            <label
              htmlFor="prod-importer"
              className="block text-xs font-medium text-neutral-700"
            >
              Importer <span className="text-destructive">*</span>
            </label>
            <Input
              id="prod-importer"
              type="text"
              required
              placeholder="e.g. Tech Imports Ltd."
              value={importer}
              onChange={(e) => setImporter(e.target.value)}
              className="text-xs h-9.5"
            />
          </div>

          {/* Delivery Heading */}
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="prod-delivery"
              className="block text-xs font-medium text-neutral-700"
            >
              Delivery Heading <span className="text-destructive">*</span>
            </label>
            <Input
              id="prod-delivery"
              type="text"
              required
              placeholder="e.g. Standard Delivery: 3-5 business days"
              value={deliveryHeading}
              onChange={(e) => setDeliveryHeading(e.target.value)}
              className="text-xs h-9.5"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Product Imagery (Cloudinary Uploads) */}
      <ProductImageUpload
        featuredImage={featuredImage}
        onFeaturedImageChange={setFeaturedImage}
        gallary={gallary}
        onGallaryChange={setGallary}
        disabled={isSubmitting}
      />

      {/* Section 3: Pricing & Status */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-semibold text-neutral-950">
            Pricing & Status
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Retail price, sale price, and product visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Regular Price */}
          <div className="space-y-1.5">
            <label
              htmlFor="prod-regular-price"
              className="block text-xs font-medium text-neutral-700"
            >
              Regular Price (৳) <span className="text-destructive">*</span>
            </label>
            <Input
              id="prod-regular-price"
              type="number"
              step="any"
              min="1"
              required
              placeholder="120"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              className="text-xs h-9.5"
            />
          </div>

          {/* Sale Price */}
          <div className="space-y-1.5">
            <label
              htmlFor="prod-sale-price"
              className="block text-xs font-medium text-neutral-700"
            >
              Sale Price (৳) <span className="text-destructive">*</span>
            </label>
            <Input
              id="prod-sale-price"
              type="number"
              step="any"
              min="1"
              required
              placeholder="99"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="text-xs h-9.5"
            />
            {Number(regularPrice) > 0 &&
              Number(salePrice) > 0 &&
              Number(regularPrice) >= Number(salePrice) && (
                <p className="text-[11px] text-emerald-700 font-medium">
                  {Math.round(
                    ((Number(regularPrice) - Number(salePrice)) /
                      Number(regularPrice)) *
                      100
                  )}
                  % off regular price
                </p>
              )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label
              htmlFor="prod-status"
              className="block text-xs font-medium text-neutral-700"
            >
              Status <span className="text-destructive">*</span>
            </label>
            <select
              id="prod-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="flex h-9.5 w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pre-order Specific Fields */}
        {status === "pre" && (
          <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-900">
              <LuCalendar className="size-4 shrink-0 text-amber-700" />
              <h3 className="text-xs font-semibold">
                Pre-Order Requirements
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="pre-launch-date"
                  className="block text-xs font-medium text-amber-950"
                >
                  Launch Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pre-launch-date"
                  type="date"
                  required={status === "pre"}
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="text-xs h-9.5 bg-white border-amber-200 text-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="pre-total-lots"
                  className="block text-xs font-medium text-amber-950"
                >
                  Total Lots <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pre-total-lots"
                  type="number"
                  min="1"
                  required={status === "pre"}
                  placeholder="100"
                  value={totalLots}
                  onChange={(e) => setTotalLots(e.target.value)}
                  className="text-xs h-9.5 bg-white border-amber-200 text-neutral-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Colors & Inventory */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Color Variants & Stock
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Available color options and stock quantities.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addColorVariant}
            className="rounded-xl h-8 text-xs gap-1 cursor-pointer border-neutral-200 hover:bg-neutral-100"
          >
            <LuPlus className="size-3.5" />
            <span>Add Color</span>
          </Button>
        </div>

        <div className="space-y-2.5">
          {colors.map((variant, index) => {
            const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(variant.value);
            return (
              <div
                key={variant._id || index}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50"
              >
                <div
                  className="size-7 rounded-lg border border-neutral-300 shrink-0"
                  style={{
                    backgroundColor: isHex ? variant.value : "#CCCCCC",
                  }}
                  title={variant.value}
                />

                <div className="flex-1 min-w-[120px]">
                  <Input
                    type="text"
                    required
                    placeholder="#000000 or White"
                    value={variant.value}
                    onChange={(e) =>
                      updateColorVariant(index, "value", e.target.value)
                    }
                    className="text-xs h-8.5 font-mono"
                  />
                </div>

                <input
                  type="color"
                  value={isHex ? variant.value : "#000000"}
                  onChange={(e) =>
                    updateColorVariant(index, "value", e.target.value)
                  }
                  className="size-8.5 rounded-lg border border-neutral-300 p-0.5 cursor-pointer bg-white shrink-0"
                  title="Pick color"
                />

                <div className="w-24 shrink-0">
                  <Input
                    type="number"
                    min="0"
                    required
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(e) =>
                      updateColorVariant(index, "stock", e.target.value)
                    }
                    className="text-xs h-8.5 text-right"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeColorVariant(index)}
                  disabled={colors.length <= 1}
                  className="text-neutral-400 hover:text-destructive shrink-0 cursor-pointer"
                  title="Remove variant"
                >
                  <LuTrash2 className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <span>Variants: {colors.length}</span>
          <span className="font-semibold text-neutral-900">
            Total Units:{" "}
            {colors.reduce((acc, c) => acc + (Number(c.stock) || 0), 0)}
          </span>
        </div>
      </div>

      {/* Section 4: Description */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-semibold text-neutral-950">
            Description
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full product specifications and details.
          </p>
        </div>

        <div className="space-y-1.5">
          <textarea
            required
            rows={5}
            placeholder="Product details, specifications, packaging, and warranty..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/admin/products">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="rounded-xl h-9.5 px-4 text-xs cursor-pointer border-neutral-200 hover:bg-neutral-100"
          >
            Cancel
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl h-9.5 px-6 text-xs bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer gap-2"
        >
          {isSubmitting ? (
            <>
              <LuLoader className="size-3.5 animate-spin" />
              <span>{isEditing ? "Updating..." : "Saving..."}</span>
            </>
          ) : (
            <span>{isEditing ? "Update Product" : "Create Product"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
