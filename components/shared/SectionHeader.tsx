import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowVariant?: "default" | "secondary" | "outline" | "preorder" | "discount" | "success" | "subtle";
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  eyebrowVariant = "outline",
  title,
  subtitle,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-10",
        align === "center" && "text-center md:items-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <div className="mb-2.5">
            <Badge variant={eyebrowVariant} className="text-xs uppercase tracking-wider font-semibold">
              {eyebrow}
            </Badge>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className={cn("shrink-0", align === "center" && "mx-auto")}>
          {action}
        </div>
      )}
    </div>
  );
}
