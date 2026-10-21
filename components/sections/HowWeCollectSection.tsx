import React from "react";
import {
  LuCompass,
  LuShieldCheck,
  LuPlane,
  LuTruck,
  LuCheck,
} from "react-icons/lu";

export function HowWeCollectSection() {
  const steps = [
    {
      num: "01",
      icon: LuCompass,
      title: "Direct Sourcing",
      desc: "Curated directly from verified hardware workshops and boutique makers in international manufacturing hubs.",
      highlight: "Direct maker vetting",
    },
    {
      num: "02",
      icon: LuShieldCheck,
      title: "Physical Inspection",
      desc: "Every unit is unboxed and tested for build quality, electronics, and finish before international departure.",
      highlight: "Pre-flight bench testing",
    },
    {
      num: "03",
      icon: LuPlane,
      title: "Customs & Freight",
      desc: "We manage overseas air cargo, statutory import taxes, and full clearance with zero surprise arrival charges.",
      highlight: "Zero extra arrival fees",
    },
    {
      num: "04",
      icon: LuTruck,
      title: "Doorstep Delivery",
      desc: "Cleared orders transfer directly to our Dhaka hub for courier delivery across all 64 districts in Bangladesh.",
      highlight: "Tracked nationwide dispatch",
    },
  ];

  return (
    <section
      id="how-we-collect"
      className="py-16 sm:py-24 bg-neutral-50/50 border-b border-neutral-200/80 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Cross-Border Process
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Our Sourcing & Shipping Process
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Our 4-stage managed pipeline from overseas factory floors to your doorstep.
            </p>
          </div>
        </div>

        {/* 4-Step Process Pipeline Grid (Visually Distinct from Product Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-white p-5 transition-all duration-200 hover:border-neutral-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              >
                <div>
                  {/* Step Header: Step Badge + Utility Icon */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-neutral-600">
                      Step {step.num}
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-50 border border-neutral-200/60 text-neutral-700 transition-colors group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900">
                      <Icon className="size-4 stroke-[1.75]" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Milestone Highlight */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-medium text-neutral-600">
                  <LuCheck className="size-3 text-neutral-900 shrink-0 stroke-[2.5]" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
