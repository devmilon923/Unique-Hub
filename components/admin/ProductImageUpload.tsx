"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import {
  LuUpload,
  LuImage,
  LuImages,
  LuTrash2,
  LuLoader,
  LuLink,
  LuCircleAlert,
  LuCheck,
  LuCrop,
} from "react-icons/lu";

interface ProductImageUploadProps {
  featuredImage: string;
  onFeaturedImageChange: (url: string) => void;
  gallary: string[];
  onGallaryChange: (urls: string[]) => void;
  disabled?: boolean;
}

interface ActiveCropTask {
  type: "featured" | "gallery";
  file: File;
  previewUrl: string;
  galleryIndex?: number;
  galleryTotal?: number;
}

const MAX_GALLERY_IMAGES = 3;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const isValidUrlOrPath = (val: string): boolean => {
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  return !/[\r\n\t<>"'`]/.test(trimmed);
};

export function ProductImageUpload({
  featuredImage,
  onFeaturedImageChange,
  gallary = [],
  onGallaryChange,
  disabled = false,
}: ProductImageUploadProps) {
  // Keep latest gallary in ref to avoid React stale closure traps in async multi-upload queues
  const gallaryRef = useRef(gallary);
  gallaryRef.current = gallary;

  // Loading states
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manual URL entry state
  const [showManualFeaturedUrl, setShowManualFeaturedUrl] = useState(false);
  const [manualFeaturedUrl, setManualFeaturedUrl] = useState("");
  const [showManualGalleryUrl, setShowManualGalleryUrl] = useState(false);
  const [manualGalleryUrl, setManualGalleryUrl] = useState("");

  // Drag states
  const [isDraggingFeatured, setIsDraggingFeatured] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // 4:3 Cropper states
  const [activeCropTask, setActiveCropTask] = useState<ActiveCropTask | null>(null);
  const [galleryQueue, setGalleryQueue] = useState<File[]>([]);
  const [galleryTotalCount, setGalleryTotalCount] = useState<number>(0);
  const [galleryCurrentStep, setGalleryCurrentStep] = useState<number>(1);

  // Hidden file inputs
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Cleanup active object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (activeCropTask) {
        URL.revokeObjectURL(activeCropTask.previewUrl);
      }
    };
  }, [activeCropTask]);

  /**
   * Helper to perform Cloudinary upload via Next.js Route Handler
   */
  const uploadFileToCloudinary = async (file: File | Blob, originalName = "product.jpg"): Promise<string> => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
    }

    const formData = new FormData();
    formData.append("file", file, originalName);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data.message || `Upload failed with status code ${res.status}`
      );
    }

    return data.url;
  };

  /**
   * Handle single file selected for Featured Image
   */
  const handleFeaturedFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError(`"${file.name}" is not a supported image file.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setActiveCropTask({
      type: "featured",
      file,
      previewUrl,
    });

    if (featuredInputRef.current) {
      featuredInputRef.current.value = "";
    }
  };

  /**
   * Handle multiple files selected for Gallery Images (max 3 total)
   */
  const handleGalleryFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const currentCount = gallaryRef.current.length;
    const remainingSlots = MAX_GALLERY_IMAGES - currentCount;
    if (remainingSlots <= 0) {
      setUploadError(`Maximum of ${MAX_GALLERY_IMAGES} gallery images reached.`);
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length && validFiles.length < remainingSlots; i++) {
      const f = files[i];
      if (f.type.startsWith("image/")) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setUploadError("No valid image files were selected.");
      return;
    }

    const [firstFile, ...restFiles] = validFiles;
    const previewUrl = URL.createObjectURL(firstFile);

    setGalleryQueue(restFiles);
    setGalleryTotalCount(validFiles.length);
    setGalleryCurrentStep(1);

    setActiveCropTask({
      type: "gallery",
      file: firstFile,
      previewUrl,
      galleryIndex: 1,
      galleryTotal: validFiles.length,
    });

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  /**
   * Triggered when the user finishes cropping an image in the 4:3 cropper modal
   */
  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!activeCropTask) return;

    const task = activeCropTask;
    const croppedFileName =
      task.file.name.replace(/\.[^/.]+$/, "") + "-4x3.jpg";
    const croppedFile = new File([croppedBlob], croppedFileName, {
      type: "image/jpeg",
    });

    URL.revokeObjectURL(task.previewUrl);
    setActiveCropTask(null);

    if (task.type === "featured") {
      setIsUploadingFeatured(true);
      try {
        const uploadedUrl = await uploadFileToCloudinary(
          croppedFile,
          croppedFileName
        );
        onFeaturedImageChange(uploadedUrl);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to upload cropped featured image.";
        setUploadError(msg);
      } finally {
        setIsUploadingFeatured(false);
      }
    } else {
      setIsUploadingGallery(true);
      try {
        const uploadedUrl = await uploadFileToCloudinary(
          croppedFile,
          croppedFileName
        );
        // Use ref to guarantee we append to the freshest state
        onGallaryChange([...gallaryRef.current, uploadedUrl]);

        // If more images remain in queue, step to next
        if (galleryQueue.length > 0) {
          const [nextFile, ...remaining] = galleryQueue;
          const nextPreviewUrl = URL.createObjectURL(nextFile);
          const nextStep = galleryCurrentStep + 1;

          setGalleryQueue(remaining);
          setGalleryCurrentStep(nextStep);

          setActiveCropTask({
            type: "gallery",
            file: nextFile,
            previewUrl: nextPreviewUrl,
            galleryIndex: nextStep,
            galleryTotal: galleryTotalCount,
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to upload cropped gallery image.";
        setUploadError(msg);
      } finally {
        setIsUploadingGallery(false);
      }
    }
  };

  /**
   * User cancelled cropping
   */
  const handleCropCancel = () => {
    if (activeCropTask) {
      URL.revokeObjectURL(activeCropTask.previewUrl);
    }
    setActiveCropTask(null);
    setGalleryQueue([]);
    setGalleryTotalCount(0);
    setGalleryCurrentStep(1);
  };

  // Handle manual featured URL submit
  const handleManualFeaturedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualFeaturedUrl.trim();
    if (!trimmed) return;
    if (!isValidUrlOrPath(trimmed)) {
      setUploadError("Please enter a valid URL (e.g. https://res.cloudinary.com/...)");
      return;
    }
    onFeaturedImageChange(trimmed);
    setManualFeaturedUrl("");
    setShowManualFeaturedUrl(false);
    setUploadError(null);
  };

  // Handle manual gallery URL submit
  const handleManualGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualGalleryUrl.trim();
    if (!trimmed) return;
    if (!isValidUrlOrPath(trimmed)) {
      setUploadError("Please enter a valid URL (e.g. https://res.cloudinary.com/...)");
      return;
    }
    if (gallary.length >= MAX_GALLERY_IMAGES) {
      setUploadError(`Maximum of ${MAX_GALLERY_IMAGES} gallery images allowed.`);
      return;
    }
    onGallaryChange([...gallary, trimmed]);
    setManualGalleryUrl("");
    setShowManualGalleryUrl(false);
    setUploadError(null);
  };

  // Remove a gallery image
  const removeGalleryImage = (indexToRemove: number) => {
    onGallaryChange(gallary.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-6">
      {/* 4:3 Image Cropper Modal */}
      {activeCropTask && (
        <ImageCropperModal
          isOpen={true}
          imageSrc={activeCropTask.previewUrl}
          title={
            activeCropTask.type === "featured"
              ? "Crop Featured Product Image (4:3)"
              : `Crop Gallery Image (${activeCropTask.galleryIndex || 1} of ${
                  activeCropTask.galleryTotal || 1
                })`
          }
          subtitle="Frame your product inside the 4:3 window. Drag to move, scroll or use slider to zoom."
          outputWidth={1200}
          outputHeight={900}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed animate-in fade-in duration-200">
          <LuCircleAlert className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-destructive/70 hover:text-destructive cursor-pointer font-bold px-1"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. Featured Image Section (4:3 Enforced) */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <LuImage className="size-4 text-neutral-700" />
              <h2 className="text-sm font-semibold text-neutral-950">
                Featured Product Image <span className="text-destructive">*</span>
              </h2>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                4:3 Ratio
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Primary cover photo displayed across catalog cards, search, and details.
            </p>
          </div>
          <button
            type="button"
            disabled={disabled || isUploadingFeatured}
            onClick={() => setShowManualFeaturedUrl((prev) => !prev)}
            className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            <LuLink className="size-3" />
            <span>{showManualFeaturedUrl ? "Hide URL input" : "Paste URL"}</span>
          </button>
        </div>

        {/* Manual URL input fallback */}
        {showManualFeaturedUrl && (
          <form
            onSubmit={handleManualFeaturedSubmit}
            className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs"
          >
            <Input
              type="url"
              placeholder="https://res.cloudinary.com/... or image link"
              value={manualFeaturedUrl}
              onChange={(e) => setManualFeaturedUrl(e.target.value)}
              className="text-xs h-8.5 bg-white"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!manualFeaturedUrl.trim()}
              className="h-8.5 px-3 text-xs bg-neutral-900 text-white shrink-0"
            >
              Set URL
            </Button>
          </form>
        )}

        {/* Featured Image State: Either 4:3 Preview or Dropzone */}
        {featuredImage ? (
          <div className="relative group rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 flex flex-col sm:flex-row items-center gap-5">
            {/* 4:3 Preview Box */}
            <div className="relative aspect-[4/3] w-52 sm:w-60 rounded-xl overflow-hidden border border-neutral-200 bg-white shrink-0 shadow-xs">
              <Image
                src={featuredImage}
                alt="Product Featured Image"
                fill
                sizes="240px"
                className="object-cover"
                unoptimized
              />
              <span className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                4:3 Ratio
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                  <LuCheck className="size-3" />
                  Featured Image Ready
                </span>
              </div>
              <p
                className="text-[11px] font-mono text-neutral-500 truncate"
                title={featuredImage}
              >
                {featuredImage}
              </p>

              <div className="flex items-center gap-2 pt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isUploadingFeatured}
                  onClick={() => featuredInputRef.current?.click()}
                  className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer border-neutral-200 hover:bg-neutral-100"
                >
                  <LuCrop className="size-3" />
                  <span>Crop & Replace</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || isUploadingFeatured}
                  onClick={() => onFeaturedImageChange("")}
                  className="rounded-xl h-8 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <LuTrash2 className="size-3 mr-1" />
                  <span>Remove</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFeatured(true);
            }}
            onDragLeave={() => setIsDraggingFeatured(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFeatured(false);
              handleFeaturedFileSelect(e.dataTransfer.files);
            }}
            onClick={() => {
              if (!disabled && !isUploadingFeatured) {
                featuredInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              isDraggingFeatured
                ? "border-neutral-900 bg-neutral-100/70"
                : "border-neutral-200 hover:border-neutral-400 bg-neutral-50/40 hover:bg-neutral-50/80"
            }`}
          >
            {isUploadingFeatured ? (
              <div className="flex flex-col items-center gap-2 py-3">
                <LuLoader className="size-6 text-neutral-900 animate-spin" />
                <p className="text-xs font-medium text-neutral-800">
                  Uploading 4:3 cropped image to Cloudinary...
                </p>
                <p className="text-[11px] text-neutral-400">
                  Processing high-res visual asset
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5">
                <div className="size-11 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700">
                  <LuCrop className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    Click to select & crop to 4:3 ratio
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Drag & drop also supported • Auto 4:3 Cropper
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={featuredInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFeaturedFileSelect(e.target.files)}
        />
      </div>

      {/* 2. Gallery Images Section (Max 3 Images, 4:3 Enforced) */}
      <div className="rounded-2xl border border-neutral-200/90 bg-card p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <LuImages className="size-4 text-neutral-700" />
              <h2 className="text-sm font-semibold text-neutral-950">
                Product Gallery (Gallary) <span className="text-destructive">*</span>
              </h2>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                4:3 Ratio
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Additional product views (minimum 1, maximum {MAX_GALLERY_IMAGES} images).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                gallary.length >= MAX_GALLERY_IMAGES
                  ? "bg-amber-50 text-amber-900 border-amber-200 font-semibold"
                  : gallary.length > 0
                  ? "bg-neutral-100 text-neutral-800 border-neutral-200"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {gallary.length} / {MAX_GALLERY_IMAGES} images
            </span>

            {gallary.length < MAX_GALLERY_IMAGES && (
              <button
                type="button"
                disabled={disabled || isUploadingGallery}
                onClick={() => setShowManualGalleryUrl((prev) => !prev)}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <LuLink className="size-3" />
                <span>{showManualGalleryUrl ? "Hide URL" : "Paste URL"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Manual Gallery URL input fallback */}
        {showManualGalleryUrl && gallary.length < MAX_GALLERY_IMAGES && (
          <form
            onSubmit={handleManualGallerySubmit}
            className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs"
          >
            <Input
              type="url"
              placeholder="https://res.cloudinary.com/... or image link"
              value={manualGalleryUrl}
              onChange={(e) => setManualGalleryUrl(e.target.value)}
              className="text-xs h-8.5 bg-white"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!manualGalleryUrl.trim()}
              className="h-8.5 px-3 text-xs bg-neutral-900 text-white shrink-0"
            >
              Add Image
            </Button>
          </form>
        )}

        {/* Gallery Image Grid (4:3 Aspect Ratio) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Uploaded 4:3 Gallery Items */}
          {gallary.map((imgUrl, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl border border-neutral-200 bg-neutral-50/50 p-2 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-neutral-200 bg-white">
                <Image
                  src={imgUrl}
                  alt={`Gallery image ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-1.5 left-1.5 bg-neutral-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                  #{idx + 1} • 4:3
                </div>
                <button
                  type="button"
                  disabled={disabled || isUploadingGallery}
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 size-6 rounded-md bg-white/90 border border-neutral-200 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Remove image"
                  aria-label={`Remove gallery image ${idx + 1}`}
                >
                  <LuTrash2 className="size-3" />
                </button>
              </div>
              <p
                className="text-[10px] font-mono text-neutral-400 truncate mt-1.5 px-0.5"
                title={imgUrl}
              >
                {imgUrl}
              </p>
            </div>
          ))}

          {/* Add Gallery Item Dropzone (if fewer than MAX_GALLERY_IMAGES) */}
          {gallary.length < MAX_GALLERY_IMAGES && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingGallery(true);
              }}
              onDragLeave={() => setIsDraggingGallery(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingGallery(false);
                handleGalleryFileSelect(e.dataTransfer.files);
              }}
              onClick={() => {
                if (!disabled && !isUploadingGallery) {
                  galleryInputRef.current?.click();
                }
              }}
              className={`min-h-[160px] aspect-[4/3] border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDraggingGallery
                  ? "border-neutral-900 bg-neutral-100/70"
                  : "border-neutral-200 hover:border-neutral-400 bg-neutral-50/40 hover:bg-neutral-50/80"
              }`}
            >
              {isUploadingGallery ? (
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <LuLoader className="size-5 text-neutral-900 animate-spin" />
                  <p className="text-xs font-medium text-neutral-800">
                    Uploading 4:3 image...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="size-8.5 rounded-lg bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700">
                    <LuCrop className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">
                      Add & Crop 4:3 Image
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Slot {gallary.length + 1} of {MAX_GALLERY_IMAGES}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleGalleryFileSelect(e.target.files)}
        />
      </div>
    </div>
  );
}
