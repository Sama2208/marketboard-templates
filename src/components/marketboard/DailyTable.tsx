import { cn } from "@/lib/utils";
import type { DayRow, MonthData } from "@/lib/rnp";
import { dayCalc, fmt, indexTone, totals } from "@/lib/rnp";

const inputCols: { key: keyof DayRow; label: string }[] = [
  { key: "budget", label: "Budjet $" },
  { key: "lead", label: "Fact Lead" },
  { key: "qlForm", label: "Q.Lead Forma" },
  { key: "qlCall", label: "Q.Lead Zvonok" },
  { key: "zapisan", label: "Yozildi" },
  { key: "keldi", label: "Keldi" },
  { key: "yotdi", label: "Yotdi" },
];

function IndexCell({ value, empty }: { value: number; empty?: boolean }) {
  const tone = indexTone(value);
  if (empty)
    return (
      <td className="cell-auto border border-border px-2 py-1.5 text-right text-muted-foreground">
        —
      </td>
    );
  return (
    <td className="cell-auto border border-border px-2 py-1.5 text-right tabular-nums">
      <span
        className={cn(
          "font-medium",
          tone === "good" && "text-success",
          tone === "warn" && "text-warning",
          tone === "bad" && "text-danger",
        )}
      >
        {fmt(value)}%
      </span>
    </td>
  );
}

export function DailyTable({
  data,
  onChangeRow,
}: {
  data: MonthData;
  onChangeRow: (day: number, key: keyof DayRow, value: number) => void;
}) {
  const t = totals(data);

  return (
    <section className="card-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold">Kunlik ma'lumotlar</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded cell-input border border-success/50" /> Qo'lda
            kiritiladi
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded cell-auto border border-border" /> Avtomatik
          </span>
        </div>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[1150px] border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/70 text-muted-foreground">
              <th className="sticky left-0 z-10 border border-border bg-secondary px-2 py-2 text-left">
                Kun
              </th>
              {inputCols.map((c) => (
                <th key={c.key} className="border border-border px-2 py-2 text-right">
                  {c.label}
                </th>
              ))}
              <th className="border border-border px-2 py-2 text-right">Lead reja</th>
              <th className="border border-border px-2 py-2 text-right">Lead Index %</th>
              <th className="border border-border px-2 py-2 text-right">CPL $</th>
              <th className="border border-border px-2 py-2 text-right">Q.Lead Total</th>
              <th className="border border-border px-2 py-2 text-right">Q.Lead Index %</th>
              <th className="border border-border px-2 py-2 text-right">CPQL $</th>
              <th className="border border-border px-2 py-2 text-right">Lead→Q.Lead %</th>
            </tr>
          </thead>
          <tbody>
            {data.days.map((row) => {
              const c = dayCalc(row, data.plan);
              return (
                <tr key={row.day} className="hover:bg-accent/40">
                  <td className="sticky left-0 z-10 border border-border bg-card px-2 py-1.5 font-medium">
                    {row.day}
                  </td>
                  {inputCols.map((col) => (
                    <td key={col.key} className="cell-input border border-border p-0">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={row[col.key] === 0 ? "" : row[col.key]}
                        placeholder="0"
                        onChange={(e) => onChangeRow(row.day, col.key, Number(e.target.value) || 0)}
                        className="w-full bg-transparent px-2 py-1.5 text-right tabular-nums outline-none focus:bg-primary/10"
                      />
                    </td>
                  ))}
                  <td className="cell-auto border border-border px-2 py-1.5 text-right tabular-nums">
                    {fmt(c.leadPlan, 1)}
                  </td>
                  <IndexCell value={c.leadIndex} empty={row.lead === 0} />
                  <td className="cell-auto border border-border px-2 py-1.5 text-right tabular-nums">
                    {fmt(c.cpl, 2)}
                  </td>
                  <td className="cell-auto border border-border px-2 py-1.5 text-right tabular-nums">
                    {fmt(c.qlTotal)}
                  </td>
                  <IndexCell value={c.qlIndex} empty={c.qlTotal === 0} />
                  <td className="cell-auto border border-border px-2 py-1.5 text-right tabular-nums">
                    {fmt(c.cpql, 2)}
                  </td>
                  <td className="cell-auto border border-border px-2 py-1.5 text-right tabular-nums">
                    {fmt(c.leadToQl)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/15 font-bold">
              <td className="sticky left-0 z-10 border border-border bg-primary/20 px-2 py-2">
                TOTAL
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.budget)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.lead)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.qlForm)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.qlCall)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.zapisan)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.keldi)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.yotdi)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(data.plan.leadGoal)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.leadIndex)}%
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.cpl, 2)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.qlTotal)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.qlIndex)}%
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.cpql, 2)}
              </td>
              <td className="border border-border px-2 py-2 text-right tabular-nums">
                {fmt(t.leadToQl)}%
              </td>
            </tr>
            <tr className="bg-secondary/60 text-xs text-muted-foreground">
              <td className="border border-border px-2 py-2 font-medium" colSpan={8}>
                Lead→Sotuv: <span className="text-foreground">{fmt(t.leadToSale, 1)}%</span>
              </td>
              <td className="border border-border px-2 py-2 font-medium" colSpan={7}>
                Q.Lead→Sotuv: <span className="text-foreground">{fmt(t.qlToSale, 1)}%</span> · CPA:{" "}
                <span className="text-foreground">${fmt(t.cpa, 2)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
