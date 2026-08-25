import { cn } from "@/lib/utils";
import { indexTone } from "@/lib/rnp";

export function StatCard({
  label,
  value,
  hint,
  index,
}: {
  label: string;
  value: string;
  hint?: string;
  index?: number;
}) {
  const tone = index === undefined ? undefined : indexTone(index);
  return (
    <div className="card-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-xl font-bold sm:text-2xl">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        {tone && (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              tone === "good" && "bg-success/15 text-success",
              tone === "warn" && "bg-warning/15 text-warning",
              tone === "bad" && "bg-danger/15 text-danger",
            )}
          >
            {index!.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
