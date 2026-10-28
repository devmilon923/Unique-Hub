"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuChevronLeft, LuChevronRight, LuArrowRight } from "react-icons/lu";
import { cn } from "@/lib/utils";

/**
 * Common Aspect Ratio Guidelines:
 * - Carousel Banners: Standard 16:9 widescreen (Recommended resolution: 1920 × 1080 px or 1280 × 720 px).
 * - Fixed Side Banner: Standard 3:4 portrait or 16:9 (Recommended resolution: 1200 × 1600 px).
 *
 * You can easily add, edit, or remove images here.
 * The carousel smoothly loops whether there is 1 image or multiple images.
 */
export interface CarouselSlide {
  id: string;
  image: string;
  alt: string;
  href?: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "banner-1",
    image: "/images/hero/c1.png",
    alt: "UniqueHub Featured Global Collection Banner 1",
    href: "/products",
  },
  {
    id: "banner-2",
    image: "/images/hero/c2.jpg",
    alt: "UniqueHub Featured Global Collection Banner 2",
    href: "/products",
  },
];

const FIXED_BANNER = {
  image: "/images/hero/fix-image.jpg",
  alt: "UniqueHub Daily Highlights and Special Offers",
  href: "/products",
};

export function HeroSection() {
  const slides = CAROUSEL_SLIDES;
  const isMultiSlide = slides.length > 1;

  // For multi-slide infinite loop: [cloneLast, ...slides, cloneFirst]
  const displaySlides = isMultiSlide
    ? [slides[slides.length - 1], ...slides, slides[0]]
    : slides;

  // Track state
  const [currentIndex, setCurrentIndex] = useState(isMultiSlide ? 1 : 0);
  const [withTransition, setWithTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Touch tracking for swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Compute active dot index (0 to slides.length - 1)
  const activeDotIndex = isMultiSlide
    ? currentIndex === 0
      ? slides.length - 1
      : currentIndex === slides.length + 1
        ? 0
        : currentIndex - 1
    : 0;

  // Next slide handler
  const handleNext = useCallback(() => {
    if (!isMultiSlide || isTransitioning) return;
    setIsTransitioning(true);
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isMultiSlide, isTransitioning]);

  // Previous slide handler
  const handlePrev = useCallback(() => {
    if (!isMultiSlide || isTransitioning) return;
    setIsTransitioning(true);
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isMultiSlide, isTransitioning]);

  // Handle transition end for seamless infinite loop
  const handleTransitionEnd = () => {
    if (!isMultiSlide) return;
    setIsTransitioning(false);

    if (currentIndex === slides.length + 1) {
      // Reached the clone of the first slide -> snap to real first slide
      setWithTransition(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Reached the clone of the last slide -> snap to real last slide
      setWithTransition(false);
      setCurrentIndex(slides.length);
    }
  };

  // Re-enable CSS transition after instantaneous position snap
  useEffect(() => {
    if (!withTransition && isMultiSlide) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [withTransition, isMultiSlide]);

  // Direct jump to a specific slide from indicators
  const goToSlide = (slideIndex: number) => {
    if (isTransitioning || slideIndex === activeDotIndex) return;
    setIsTransitioning(true);
    setWithTransition(true);
    setCurrentIndex(slideIndex + 1);
  };

  // Autoplay timer (4.5s) - pauses on hover
  useEffect(() => {
    if (!isMultiSlide || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isMultiSlide, isPaused, handleNext]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Popular categories list
  const categories = [
    {
      name: "Mens",
      href: "/products?category=mens",
      image: "/images/categories/mens.png",
    },
    {
      name: "Women",
      href: "/products?category=women",
      image: "/images/categories/womens.png",
    },
    {
      name: "Baby",
      href: "/products?category=baby",
      image: "/images/categories/baby.png",
    },
    {
      name: "Gadgets",
      href: "/products?category=gadgets",
      image: "/images/categories/gadgets.png",
    },
    {
      name: "Lights",
      href: "/products?category=lights",
      image: "/images/categories/lights.png",
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-neutral-200/80 bg-white  pb-10 sm:pb-14 lg:pb-16">
      {/* Subtle ambient gradient lighting */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl opacity-40 select-none"
        aria-hidden="true"
      >
        <div className="aspect-[1155/400] w-[68rem] max-w-none bg-gradient-to-tr from-neutral-200/40 via-neutral-100/50 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 70% / 30% Hero Banner Row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3.5 sm:gap-4 lg:gap-5 items-stretch">
          {/* 70% Image-Only Looping Carousel */}
          <div className="lg:col-span-7 w-full">
            <div
              className="group relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/80 shadow-xs select-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Single Image Case (No tracking clones needed) */}
              {!isMultiSlide ? (
                <div className="relative w-full h-full">
                  {slides[0]?.href ? (
                    <Link
                      href={slides[0].href}
                      className="block relative w-full h-full"
                    >
                      <Image
                        src={slides[0].image}
                        alt={slides[0].alt}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className="object-cover w-full h-full"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={
                        slides[0]?.image ||
                        "/images/banners/carousel-banner-1.svg"
                      }
                      alt={slides[0]?.alt || "Carousel Banner"}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              ) : (
                /* Multi-Image Looping Slider Track */
                <>
                  <div
                    className={cn(
                      "flex h-full w-full",
                      withTransition
                        ? "transition-transform duration-500 ease-out"
                        : "transition-none",
                    )}
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                    onTransitionEnd={handleTransitionEnd}
                  >
                    {displaySlides.map((slide, idx) => (
                      <div
                        key={`${slide.id}-${idx}`}
                        className="relative h-full w-full shrink-0 grow-0"
                      >
                        {slide.href ? (
                          <Link
                            href={slide.href}
                            className="block relative w-full h-full"
                          >
                            <Image
                              src={slide.image}
                              alt={slide.alt}
                              fill
                              priority={idx === 1}
                              sizes="(max-width: 1024px) 100vw, 70vw"
                              className="object-cover w-full h-full select-none pointer-events-none"
                            />
                          </Link>
                        ) : (
                          <Image
                            src={slide.image}
                            alt={slide.alt}
                            fill
                            priority={idx === 1}
                            sizes="(max-width: 1024px) 100vw, 70vw"
                            className="object-cover w-full h-full select-none pointer-events-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Previous Slide Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous slide"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex size-8 sm:size-10 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow-md backdrop-blur-xs hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  >
                    <LuChevronLeft className="size-4 sm:size-5" />
                  </button>

                  {/* Next Slide Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next slide"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex size-8 sm:size-10 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow-md backdrop-blur-xs hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  >
                    <LuChevronRight className="size-4 sm:size-5" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-10 flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-none">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-xs pointer-events-auto">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => goToSlide(i)}
                          aria-label={`Go to slide ${i + 1}`}
                          className={cn(
                            "h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer",
                            activeDotIndex === i
                              ? "w-5 sm:w-6 bg-white"
                              : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 30% Fixed Promotional Image */}
          <div className="lg:col-span-3 w-full">
            <div className="group relative w-full h-full min-h-[190px] sm:min-h-[240px] lg:min-h-0 aspect-[16/9] lg:aspect-auto overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/80 shadow-xs select-none">
              {FIXED_BANNER.href ? (
                <Link
                  href={FIXED_BANNER.href}
                  className="block relative w-full h-full"
                >
                  <Image
                    src={FIXED_BANNER.image}
                    alt={FIXED_BANNER.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </Link>
              ) : (
                <Image
                  src={FIXED_BANNER.image}
                  alt={FIXED_BANNER.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Curated Categories */}
        <div className="animate-fade-in-up animation-delay-150 mt-8 sm:mt-10 lg:mt-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Popular Categories
            </h2>
          </div>

          {/* Categories Horizontal Swipe Rail / Grid */}
          <div className="flex sm:grid sm:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4 overflow-x-auto sm:overflow-visible no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 snap-x snap-mandatory">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative flex flex-col w-[115px] sm:w-auto shrink-0 sm:shrink rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-2 sm:p-2.5 transition-all duration-200 hover:bg-white hover:border-neutral-300 hover:shadow-xs cursor-pointer snap-start active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white border border-neutral-100">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 115px, (max-width: 1024px) 20vw, 20vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="mt-2 sm:mt-2.5 flex items-center justify-between px-0.5 sm:px-1 py-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-900 tracking-tight group-hover:text-neutral-950 truncate">
                    {category.name}
                  </span>
                  <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-white border border-neutral-200/60 text-neutral-400 group-hover:text-neutral-900 group-hover:border-neutral-300 transition-all duration-150 shrink-0">
                    <LuArrowRight className="size-2.5 sm:size-3 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
