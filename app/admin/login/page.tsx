"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LuPackage,
  LuLock,
  LuMail,
  LuEye,
  LuEyeOff,
  LuArrowLeft,
  LuCircleAlert,
  LuLoader,
} from "react-icons/lu";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Guard against redirect loops
  const rawRedirect = searchParams.get("redirect");
  const targetPath =
    rawRedirect && !rawRedirect.includes("/admin/login") ? rawRedirect : "/admin";

  const { login, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as admin, redirect immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      router.replace(targetPath);
    }
  }, [authLoading, isAuthenticated, isAdmin, router, targetPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user = await login({ email, password });
      if (user.role !== "admin") {
        setErrorMessage("Access denied: Account does not have admin permissions.");
        return;
      }
      router.replace(targetPath);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please verify credentials.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If checking existing session, show minimal loader to prevent layout flashing
  if (authLoading || (isAuthenticated && isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <LuLoader className="size-4 animate-spin text-neutral-800" />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-sm mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <LuArrowLeft className="size-3.5" />
          <span>Back to Storefront</span>
        </Link>
      </div>

      <div className="w-full max-w-sm bg-card rounded-2xl border border-neutral-200/90 shadow-card p-6 sm:p-7">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs mb-3">
            <LuPackage className="size-5 stroke-[2.2]" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-950">
            Admin Sign In
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access UniqueHub inventory and orders.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
            <LuCircleAlert className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-neutral-700"
            >
              Email Address
            </label>
            <div className="relative">
              <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="pl-10 text-xs h-9.5"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-neutral-700"
            >
              Password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="pl-10 pr-10 text-xs h-9.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <LuEyeOff className="size-4" />
                ) : (
                  <LuEye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-medium mt-1 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LuLoader className="size-3.5 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <LuLoader className="size-4 animate-spin text-neutral-800" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
