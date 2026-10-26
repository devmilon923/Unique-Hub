"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LuLoader } from "react-icons/lu";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      const redirectParam = encodeURIComponent(pathname);
      router.replace(`/admin/login?redirect=${redirectParam}`);
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname]);

  // Initial verification screen before session status is determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex items-center gap-2.5 text-xs text-neutral-500 font-medium">
          <LuLoader className="size-4 animate-spin text-neutral-800" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  // Hide protected content while redirecting unauthorized visitor
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
