import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChangeEvent } from "react";
import { Lock, Plus, Trash2, Users } from "lucide-react";
import { fmt } from "@/lib/rnp";
import { operatorMetrics, salesTotals, type SalesData, type SalesOperator } from "@/lib/sales";

const inputClass =
  "w-full min-w-[78px] rounded-md border border-success/40 bg-success/10 px-2 py-1.5 text-right text-xs outline-none focus:border-success focus:ring-1 focus:ring-success/30";
const autoCellClass = "bg-secondary/40 px-3 py-2 text-right tabular-nums text-muted-foreground";
const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

type NumericField = Exclude<keyof SalesOperator, "id" | "operatorName">;

export function SalesOperators({
  data,
  rnpLeadTotal,
  isPro,
  disabled,
  onAdd,
  onChange,
  onDelete,
  onClear,
}: {
  data: SalesData;
  rnpLeadTotal: number;
  isPro: boolean;
  disabled?: boolean;
  onAdd: () => void;
  onChange: (id: string, patch: Partial<SalesOperator>) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  if (!isPro) {
    return (
      <section className="card-surface mx-auto max-w-3xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pro</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Sotuv / Operatorlar</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Operatorlar kesimida sotuv, tushum va o'rta chekni kuzatish uchun Pro rejaga o'ting.
            </p>
            <a
              href="https://t.me/samandartargetadmin"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Pro olish (Telegram)
            </a>
          </div>
        </div>
      </section>
    );
  }

  const totals = salesTotals(data.operators);
  const leadMismatch = Math.abs(totals.lead - rnpLeadTotal) > 0.001;
  const chartData = data.operators.map((operator) => ({
    name: operator.operatorName || "Nomsiz",
    Summa: operator.revenue,
    Sotuv: operator.sales,
  }));

  const updateNumber =
    (id: string, key: NumericField) => (event: ChangeEvent<HTMLInputElement>) => {
      onChange(id, { [key]: Math.max(0, Number(event.target.value) || 0) });
    };

  return (
    <section className="space-y-4">
      <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-base font-semibold">Sotuv / Operatorlar</h2>
            <p className="text-xs text-muted-foreground">
              Sotuv, summa va konversiyalar operatorlar kesimida
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Operator qo'shish
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled || data.operators.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/50 px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Barchasini tozalash
          </button>
        </div>
      </div>

      {leadMismatch ? (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          Operatorlar lead yig'indisi ({fmt(totals.lead)}) RNP TOTAL lead ({fmt(rnpLeadTotal)})
          bilan mos emas.
        </p>
      ) : null}

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1260px] w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
                <th className="sticky left-0 z-10 min-w-[150px] bg-secondary/80 px-3 py-3 font-semibold">
                  Operator
                </th>
                <th className="min-w-[95px] px-3 py-3 font-semibold">Lead</th>
                <th className="min-w-[95px] px-3 py-3 font-semibold">Sifatli</th>
                <th className="min-w-[105px] px-3 py-3 font-semibold">Rozi</th>
                <th className="min-w-[105px] px-3 py-3 font-semibold">Tashrif</th>
                <th className="min-w-[95px] px-3 py-3 font-semibold">Sotuv</th>
                <th className="min-w-[125px] px-3 py-3 font-semibold">Summa (so'm)</th>
                <th className="min-w-[105px] bg-secondary/30 px-3 py-3 font-semibold">
                  O'rta chek
                </th>
                <th className="min-w-[78px] bg-secondary/30 px-3 py-3 font-semibold">QL %</th>
                <th className="min-w-[78px] bg-secondary/30 px-3 py-3 font-semibold">Rozi %</th>
                <th className="min-w-[78px] bg-secondary/30 px-3 py-3 font-semibold">Tashrif %</th>
                <th className="min-w-[78px] bg-secondary/30 px-3 py-3 font-semibold">Sotuv %</th>
                <th className="min-w-[105px] bg-secondary/30 px-3 py-3 font-semibold">
                  QL→Tashrif
                </th>
                <th className="min-w-[100px] bg-secondary/30 px-3 py-3 font-semibold">QL→Sotuv</th>
                <th className="w-[48px] bg-secondary/30 px-2 py-3" aria-label="Amallar" />
              </tr>
            </thead>
            <tbody>
              {data.operators.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Hali operator qo'shilmagan. Birinchi operatorni qo'shing.
                  </td>
                </tr>
              ) : (
                data.operators.map((operator) => {
                  const metrics = operatorMetrics(operator);
                  return (
                    <tr key={operator.id} className="border-b border-border last:border-b-0">
                      <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-2">
                        <input
                          value={operator.operatorName}
                          onChange={(event) =>
                            onChange(operator.id, { operatorName: event.target.value })
                          }
                          className="w-full min-w-[130px] rounded-md border border-success/40 bg-success/10 px-2 py-1.5 text-xs outline-none focus:border-success focus:ring-1 focus:ring-success/30"
                          placeholder="Operator nomi"
                        />
                      </td>
                      {(
                        [
                          "lead",
                          "qualified",
                          "visitAgreed",
                          "visited",
                          "sales",
                          "revenue",
                        ] as NumericField[]
                      ).map((key) => (
                        <td key={key} className="border-r border-border px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step={key === "revenue" ? "1000" : "1"}
                            value={operator[key] === 0 ? "" : operator[key]}
                            placeholder="0"
                            onChange={updateNumber(operator.id, key)}
                            className={inputClass}
                          />
                        </td>
                      ))}
                      <td className={autoCellClass}>{fmt(metrics.avgCheck)} so'm</td>
                      <td className={autoCellClass}>{fmt(metrics.qualifiedRate, 1)}%</td>
                      <td className={autoCellClass}>{fmt(metrics.visitAgreedRate, 1)}%</td>
                      <td className={autoCellClass}>{fmt(metrics.visitedRate, 1)}%</td>
                      <td className={autoCellClass}>{fmt(metrics.salesRate, 1)}%</td>
                      <td className={autoCellClass}>{fmt(metrics.qualifiedToVisit, 1)}%</td>
                      <td className={autoCellClass}>{fmt(metrics.qualifiedToSale, 1)}%</td>
                      <td className="bg-secondary/30 px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => onDelete(operator.id)}
                          disabled={disabled}
                          aria-label={`${operator.operatorName || "Operator"} operatorini o'chirish`}
                          title="Operatorni o'chirish"
                          className="inline-flex rounded-md p-1.5 text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              <tr className="bg-secondary/50 font-semibold">
                <td className="sticky left-0 z-10 bg-secondary/80 px-3 py-3">TOTAL</td>
                <td className="px-3 py-3 text-right">{fmt(totals.lead)}</td>
                <td className="px-3 py-3 text-right">{fmt(totals.qualified)}</td>
                <td className="px-3 py-3 text-right">{fmt(totals.visitAgreed)}</td>
                <td className="px-3 py-3 text-right">{fmt(totals.visited)}</td>
                <td className="px-3 py-3 text-right">{fmt(totals.sales)}</td>
                <td className="px-3 py-3 text-right">{fmt(totals.revenue)} so'm</td>
                <td className="px-3 py-3 text-right">{fmt(totals.avgCheck)} so'm</td>
                <td colSpan={6} className="px-3 py-3 text-right text-muted-foreground">
                  Operatorlar: {data.operators.length}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="font-display text-sm font-semibold">Operatorlar bo'yicha summa</h3>
          <div className="mt-4 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${fmt(Number(value))} so'm`, "Summa"]}
                  />
                  <Bar dataKey="Summa" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-display text-sm font-semibold">Operatorlar bo'yicha sotuv</h3>
          <div className="mt-4 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [fmt(Number(value)), "Sotuv"]}
                  />
                  <Bar dataKey="Sotuv" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Operator ma'lumoti yo'q
    </div>
  );
}
