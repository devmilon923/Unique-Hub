"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  LuCompass,
  LuShoppingBag,
  LuMenu,
  LuX,
  LuPackage,
  LuArrowRight,
  LuShieldCheck,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalCount, setIsCartOpen } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();

  // Close mobile drawer upon route transitions
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Dynamic scroll state with passive listener for butter-smooth framerates
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Products", href: "/products" },
    { name: "Pre-Orders", href: "/#pre-order" },
    { name: "Featured", href: "/#featured" },
    { name: "Contact", href: "/#contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/products") {
      return pathname.startsWith("/products");
    }
    return false;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mb-12 md:mb-22 w-full transition-all duration-300 pointer-events-none",
        isScrolled ? "pt-2 sm:pt-2.5 pb-2" : "pt-3 sm:pt-4 pb-2",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex h-14 sm:h-15 items-center justify-between px-3.5 sm:px-5 lg:px-6 rounded-2xl border transition-all duration-300 pointer-events-auto bg-white/85 backdrop-blur-xl border-neutral-200/90 shadow-sm",
          )}
        >
          {/* Brand Logotype with Minimalist Emblem */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 focus-visible:outline-none"
            aria-label="UniqueHub Home"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <LuPackage className="size-4 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-[family-name:var(--font-geist-sans)] text-base sm:text-lg font-bold tracking-tight text-neutral-950 transition-colors group-hover:text-neutral-700">
                Unique<span className="font-normal text-neutral-400">Hub</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[9px] font-mono font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200/70">
                BD
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Centered & Refined */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95",
                    active
                      ? "text-neutral-950 font-semibold bg-neutral-100 shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Integrated Search Trigger, Dynamic Cart, and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Find Product Button */}
            <Link
              href="/products"
              className="group flex size-8 sm:size-auto sm:px-3.5 sm:py-1.5 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-neutral-200/90 bg-neutral-50/80 hover:bg-neutral-100 hover:border-neutral-300 text-neutral-800 hover:text-neutral-950 text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
              aria-label="Find Product"
            >
              <LuCompass className="size-4 sm:size-3.5 text-neutral-600 group-hover:text-neutral-950 group-hover:rotate-45 transition-transform duration-200" />
              <span className="hidden sm:inline">Find Product</span>
            </Link>

            {/* Cart Trigger with Responsive Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="group relative flex size-8 sm:size-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 hover:text-neutral-950 transition-all duration-150 text-xs font-medium active:scale-95 cursor-pointer shadow-2xs"
              aria-label={`View Cart, ${totalCount} items`}
            >
              <LuShoppingBag className="size-4 text-neutral-700 group-hover:text-neutral-950 transition-colors" />
              <span className="hidden sm:inline font-medium text-neutral-700 group-hover:text-neutral-950">
                Cart
              </span>
              {totalCount > 0 ? (
                <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto flex items-center justify-center min-w-4 sm:min-w-[18px] h-4 sm:h-[18px] px-1 rounded-full bg-neutral-900 text-[9px] sm:text-[10px] font-mono font-bold text-white tabular-nums shadow-xs">
                  {totalCount}
                </span>
              ) : (
                <span className="hidden sm:inline text-neutral-400 font-mono text-[10px]">
                  0
                </span>
              )}
            </button>

            {/* Admin Portal Indicator for Authenticated Admins */}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                className="group flex size-8 sm:size-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 rounded-xl border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-150 text-xs font-medium active:scale-95 shadow-2xs"
                aria-label="Go to Admin Dashboard"
              >
                <LuShieldCheck className="size-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="md:hidden flex size-8 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer active:scale-95 ml-0.5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <LuX className="size-4.5" />
              ) : (
                <LuMenu className="size-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-xl p-3 shadow-sm pointer-events-auto space-y-1 animate-fade-in-up">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-neutral-100 text-neutral-950 font-semibold"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                  )}
                >
                  <span>{link.name}</span>
                  <LuArrowRight className="size-3.5 text-neutral-400" />
                </Link>
              );
            })}
            <div className="pt-2 mt-1 border-t border-neutral-100 space-y-1">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-neutral-50 hover:bg-neutral-100 px-3.5 py-2.5 text-xs font-medium text-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LuCompass className="size-3.5 text-neutral-600" />
                  <span>Find Product</span>
                </div>
                <LuArrowRight className="size-3.5 text-neutral-400" />
              </Link>
              <Link
                href={isAuthenticated && isAdmin ? "/admin" : "/admin/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl hover:bg-neutral-50 px-3.5 py-2 text-xs font-medium text-neutral-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LuShieldCheck className="size-3.5 text-neutral-500" />
                  <span>{isAuthenticated && isAdmin ? "Admin Dashboard" : "Admin Sign In"}</span>
                </div>
                <LuArrowRight className="size-3 text-neutral-400" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
