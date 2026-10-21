import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight,
  LuCompass,
  LuShieldCheck,
  LuPlane,
  LuTruck,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const trustMetrics = [
    {
      step: "01",
      icon: LuCompass,
      title: "Direct Sourcing",
      desc: "Vetted overseas makers & boutique labs",
    },
    {
      step: "02",
      icon: LuShieldCheck,
      title: "100% Customs Cleared",
      desc: "Zero surprise post-arrival tariffs or fees",
    },
    {
      step: "03",
      icon: LuPlane,
      title: "Consolidated Air Cargo",
      desc: "Scheduled express flights into Dhaka",
    },
    {
      step: "04",
      icon: LuTruck,
      title: "All 64 BD Districts",
      desc: "Tracked home delivery & local BDT payment",
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-neutral-200/80 bg-white  pb-10 sm:pb-16 lg:pb-20">
      {/* Subtle ambient lighting for frosted glass navbar blur depth */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl opacity-50 select-none"
        aria-hidden="true"
      >
        <div className="aspect-[1155/400] w-[68rem] max-w-none bg-gradient-to-tr from-neutral-200/40 via-neutral-100/60 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Balanced Grid: 1 col on mobile (text only), 2 cols on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Direct, to-the-point copy */}
          <div className="flex flex-col items-start text-left space-y-4 sm:space-y-6 w-full">
            {/* Cohesive High-Contrast Drop Tag */}
            <Link
              href="#pre-order"
              className="animate-fade-in-up group inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-neutral-50/80 p-1 pr-3 text-xs hover:border-neutral-400 hover:bg-white transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-2xs max-w-full"
            >
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white uppercase shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Batch 08
              </span>
              <span className="font-medium text-neutral-700 text-xs group-hover:text-neutral-900 transition-colors truncate">
                Direct air cargo drop is live
              </span>
              <LuArrowRight className="size-3 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
            </Link>

            {/* Hero Headline - guaranteed 2-line balance on mobile devices */}
            <h1 className="animate-fade-in-up animation-delay-75 w-full text-[clamp(1.5rem,6.4vw,1.75rem)] sm:text-4xl lg:text-[3.25rem] xl:text-[3.65rem] font-semibold tracking-[-0.035em] text-neutral-900 leading-[1.16] sm:leading-[1.14] sm:[text-wrap:balance]">
              <span className="block sm:inline">Discover amazing products</span>{" "}
              <span className="block sm:inline">
                you won&apos;t find anywhere else.
              </span>
            </h1>

            {/* Subtitle - fills width comfortably without awkward line breaks */}
            <p className="animate-fade-in-up animation-delay-150 w-full text-sm sm:text-base lg:text-lg text-neutral-500 leading-relaxed font-normal">
              Hand-picked tech, workspace tools, and distinctive everyday gear
              from overseas makers. We handle international shipping, customs,
              and doorstep delivery with transparent local pricing.
            </p>

            {/* CTA Buttons - 50/50 full width grid on mobile, inline on desktop */}
            <div className="animate-fade-in-up animation-delay-225 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto pt-1">
              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-neutral-900 px-3 sm:px-6 font-medium text-white shadow-none hover:bg-neutral-800 text-xs sm:text-sm cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] h-11"
                >
                  <span>Shop Now</span>
                  <LuArrowRight className="size-3.5 sm:size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>

              <Link href="#pre-order" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-xl border-neutral-200 bg-white px-3 sm:px-6 font-medium text-neutral-800 hover:bg-neutral-50 shadow-none text-xs sm:text-sm cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] h-11"
                >
                  View Pre-Orders
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Transparent Image (Hidden on mobile devices, shown on desktop lg:) */}
          <div className="animate-fade-in animation-delay-150 hidden lg:flex relative w-full items-center justify-end">
            <div className="relative w-full max-w-[540px] xl:max-w-[600px] flex items-center justify-center">
              <Image
                src="/images/hero.png"
                alt="UniqueHub Cross-Border Global Air Shipping and Doorstep Delivery"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>

        {/* Architectural 4-Pillar Assurance Cards - compact 2x2 grid on mobile */}
        <div className="animate-fade-in-up animation-delay-300 mt-8 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {trustMetrics.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="group relative rounded-xl border border-neutral-200/80 bg-neutral-50/40 p-3 sm:p-4 transition-all duration-200 hover:bg-white hover:border-neutral-300 hover:shadow-xs text-left"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-white border border-neutral-200/80 text-neutral-800 shadow-2xs group-hover:scale-105 group-hover:text-neutral-950 transition-all duration-200">
                    <Icon className="size-3.5 sm:size-4 stroke-[1.8]" />
                  </div>
                  <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-neutral-400 tracking-wider">
                    {point.step}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-neutral-900 tracking-tight leading-tight">
                  {point.title}
                </h3>
                <p className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 leading-snug sm:leading-normal font-normal">
                  {point.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
