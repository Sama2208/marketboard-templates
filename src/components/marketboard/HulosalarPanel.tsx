import { BarChart3, CircleDollarSign, ReceiptText, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { fmt, indexTone } from "@/lib/rnp";
import type { HulosalarCost, HulosalarResult, HulosalarRow } from "@/lib/hulosalar";
import { cn } from "@/lib/utils";

export function HulosalarPanel({ result }: { result: HulosalarResult }) {
  return (
    <section className="space-y-4">
      <div className="card-surface p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">Hulosalar</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tanlangan mijoz va oy bo'yicha Reja / Fakt jamlanmasi
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-[620px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Ko'rsatkich</th>
                <th className="px-4 py-3 text-right font-semibold">Reja</th>
                <th className="px-4 py-3 text-right font-semibold">Fakt</th>
                <th className="px-4 py-3 text-right font-semibold">Index</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <HulosalarTableRow key={row.key} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CostCard
          icon={<CircleDollarSign className="h-4 w-4" />}
          label="Budjet"
          values={result.marketing.budget}
          suffix="$"
        />
        <CostCard
          icon={<ReceiptText className="h-4 w-4" />}
          label="CPL"
          values={result.marketing.cpl}
          suffix="$"
        />
        <CostCard
          icon={<ReceiptText className="h-4 w-4" />}
          label="CPQL"
          values={result.marketing.cpql}
          suffix="$"
        />
        <CostCard
          icon={<ReceiptText className="h-4 w-4" />}
          label="CPA"
          values={result.marketing.cpa}
          suffix="$"
        />
      </div>

      <div className="card-surface p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold">Sotuv xulosasi</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Operatorlar blokidan avtomatik keladi
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Sotuv soni" value={fmt(result.sales.sales)} />
          <SummaryCard label="Umumiy summa" value={`${fmt(result.sales.revenue)} so'm`} />
          <SummaryCard label="O'rta chek" value={`${fmt(result.sales.avgCheck)} so'm`} />
        </div>
      </div>
    </section>
  );
}

function HulosalarTableRow({ row }: { row: HulosalarRow }) {
  const tone = indexTone(row.index);
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 font-medium">{row.label}</td>
      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
        {formatValue(row.plan, row.kind)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{formatValue(row.fact, row.kind)}</td>
      <td className="px-4 py-3 text-right">
        <span
          className={cn(
            "inline-flex min-w-[52px] justify-center rounded-md px-2 py-1 text-xs font-semibold",
            tone === "good" && "bg-success/15 text-success",
            tone === "warn" && "bg-warning/15 text-warning",
            tone === "bad" && "bg-danger/15 text-danger",
          )}
        >
          {fmt(row.index, 0)}%
        </span>
      </td>
    </tr>
  );
}

function CostCard({
  icon,
  label,
  values,
  suffix,
}: {
  icon: ReactNode;
  label: string;
  values: HulosalarCost;
  suffix: string;
}) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[11px] text-muted-foreground">Reja</p>
          <p className="mt-1 font-display font-semibold">{formatCost(values.plan, suffix)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Fakt</p>
          <p className="mt-1 font-display font-semibold">{formatCost(values.fact, suffix)}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function formatValue(value: number, kind: HulosalarRow["kind"]) {
  if (kind === "percent") return `${fmt(value, 1)}%`;
  return fmt(value);
}

function formatCost(value: number, suffix: string) {
  return value > 0 ? `${suffix}${fmt(value, 2)}` : "—";
}
