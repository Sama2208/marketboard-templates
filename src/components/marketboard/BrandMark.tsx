import { BarChart3 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="MarketBoard bosh sahifasi"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
        <BarChart3 className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Market<span className="text-primary">Board</span>
      </span>
    </Link>
  );
}
