"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  LuCrop,
  LuZoomIn,
  LuZoomOut,
  LuRotateCcw,
  LuCheck,
  LuX,
  LuCircleAlert,
} from "react-icons/lu";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  title?: string;
  subtitle?: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  outputWidth?: number; // default 1200
  outputHeight?: number; // default 900 (4:3 ratio)
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  title = "Crop Image to 4:3 Ratio",
  subtitle = "Drag to reposition and use zoom to frame your product in 4:3 format.",
  onCropComplete,
  onCancel,
  outputWidth = 1200,
  outputHeight = 900,
}: ImageCropperModalProps) {
  // Container dimensions (responsive 4:3 viewport)
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 440, height: 330 });

  // Image load & dimensions
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // Update viewport size based on container width
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      if (containerRef.current) {
        const availableWidth = Math.min(
          containerRef.current.clientWidth - 32,
          500
        );
        const width = Math.max(260, availableWidth);
        const height = Math.round(width * 0.75); // 4:3
        setViewportSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  // Reset state when new image opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
      setImageError(null);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError("Unable to load image. The format may be unsupported or corrupted.");
      };
      img.src = imageSrc;
      imageRef.current = img;
    }
  }, [isOpen, imageSrc]);

  // Calculate base scale to cover the 4:3 viewport
  const getBaseScale = useCallback(() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    const scaleX = viewportSize.width / naturalSize.width;
    const scaleY = viewportSize.height / naturalSize.height;
    return Math.max(scaleX, scaleY);
  }, [naturalSize, viewportSize]);

  // Clamp pan so image never exposes empty background
  const clampPan = useCallback(
    (newX: number, newY: number, currentZoom: number) => {
      const baseScale = getBaseScale();
      const currentWidth = naturalSize.width * baseScale * currentZoom;
      const currentHeight = naturalSize.height * baseScale * currentZoom;

      const maxPanX = Math.max(0, (currentWidth - viewportSize.width) / 2);
      const maxPanY = Math.max(0, (currentHeight - viewportSize.height) / 2);

      const clampedX = Math.min(maxPanX, Math.max(-maxPanX, newX));
      const clampedY = Math.min(maxPanY, Math.max(-maxPanY, newY));

      return { x: clampedX, y: clampedY };
    },
    [getBaseScale, naturalSize, viewportSize]
  );

  // Zoom handler with pan reclamping
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(3, Math.max(1, newZoom));
    setZoom(clampedZoom);
    setPan((prevPan) => clampPan(prevPan.x, prevPan.y, clampedZoom));
  };

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!imageLoaded) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = panStartRef.current.x + dx;
    const nextY = panStartRef.current.y + dy;
    setPan(clampPan(nextX, nextY, zoom));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer was already released
      }
    }
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoomChange(zoom + delta);
  };

  // Reset to default zoom and center
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export cropped canvas
  const handleCrop = () => {
    if (!imageRef.current || !imageLoaded) return;

    const img = imageRef.current;
    const baseScale = getBaseScale();
    const scaleFactor = baseScale * zoom;

    // Viewport dimensions in source image coordinates
    const srcWidth = viewportSize.width / scaleFactor;
    const srcHeight = viewportSize.height / scaleFactor;

    // Source center coordinates
    const srcCenterX = naturalSize.width / 2 - pan.x / scaleFactor;
    const srcCenterY = naturalSize.height / 2 - pan.y / scaleFactor;

    const srcX = Math.max(
      0,
      Math.min(naturalSize.width - srcWidth, srcCenterX - srcWidth / 2)
    );
    const srcY = Math.max(
      0,
      Math.min(naturalSize.height - srcHeight, srcCenterY - srcHeight / 2)
    );

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/jpeg",
      0.92
    );
  };

  if (!isOpen || !imageSrc) return null;

  const baseScale = getBaseScale();
  const renderedWidth = naturalSize.width * baseScale * zoom;
  const renderedHeight = naturalSize.height * baseScale * zoom;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-card p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-neutral-900"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <LuCrop className="size-4 text-neutral-900" />
              <h2 className="text-sm sm:text-base font-semibold text-neutral-950">
                {title}
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                4:3 Ratio
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="size-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close cropper"
          >
            <LuX className="size-4" />
          </button>
        </div>

        {/* Error Banner */}
        {imageError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <LuCircleAlert className="size-4 shrink-0" />
            <span className="flex-1">{imageError}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-7 text-xs"
            >
              Close
            </Button>
          </div>
        )}

        {/* 4:3 Crop Viewport Container */}
        {!imageError && (
          <div className="flex flex-col items-center justify-center select-none">
            <div
              className="relative overflow-hidden rounded-xl border-2 border-neutral-800 bg-neutral-950 shadow-inner cursor-grab active:cursor-grabbing touch-none"
              style={{
                width: `${viewportSize.width}px`,
                height: `${viewportSize.height}px`,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
            >
              {/* The Image being transformed */}
              {imageLoaded ? (
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute max-w-none pointer-events-none select-none"
                  style={{
                    width: `${renderedWidth}px`,
                    height: `${renderedHeight}px`,
                    left: `${(viewportSize.width - renderedWidth) / 2 + pan.x}px`,
                    top: `${(viewportSize.height - renderedHeight) / 2 + pan.y}px`,
                  }}
                />
              ) : (
                <div className="size-full flex items-center justify-center text-neutral-500 text-xs">
                  Loading image...
                </div>
              )}

              {/* Rule-of-Thirds Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/25">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>

              {/* 4 Corner Markers */}
              <div className="absolute top-1.5 left-1.5 size-3 border-t-2 border-l-2 border-white pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 size-3 border-t-2 border-r-2 border-white pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 size-3 border-b-2 border-l-2 border-white pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 size-3 border-b-2 border-r-2 border-white pointer-events-none" />
            </div>

            <div className="flex items-center justify-between w-full mt-2 text-[11px] text-neutral-400 px-1">
              <span>Aspect ratio: 4:3 ({outputWidth}×{outputHeight}px)</span>
              <span>Drag to move • Scroll to zoom</span>
            </div>
          </div>
        )}

        {/* Zoom & Reset Controls */}
        {!imageError && (
          <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.2)}
              disabled={zoom <= 1}
              className="size-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:opacity-40 cursor-pointer"
              title="Zoom out"
            >
              <LuZoomOut className="size-3.5" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              aria-label="Image zoom"
            />

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.2)}
              disabled={zoom >= 3}
              className="size-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:opacity-40 cursor-pointer"
              title="Zoom in"
            >
              <LuZoomIn className="size-3.5" />
            </button>

            <span className="text-[11px] font-mono text-neutral-500 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="rounded-lg h-7 px-2 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer gap-1"
            >
              <LuRotateCcw className="size-3" />
              <span>Reset</span>
            </Button>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl h-9 px-4 text-xs cursor-pointer border-neutral-200 hover:bg-neutral-100"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleCrop}
            disabled={!imageLoaded || Boolean(imageError)}
            className="rounded-xl h-9 px-5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer gap-1.5"
          >
            <LuCheck className="size-3.5" />
            <span>Crop & Upload</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
