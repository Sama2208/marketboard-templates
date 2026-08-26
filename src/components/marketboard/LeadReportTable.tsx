import { Fragment } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  calculateOperatorTotals,
  rowShare,
  rowTotal,
  statusGroup,
  type LeadReportOperator,
} from "@/lib/lead-report";

const numberValue = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

function Metric({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-display text-base font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export function LeadReportSummary({
  totals,
}: {
  totals: {
    leads: number;
    quality: number;
    booked: number;
    attended: number;
    won: number;
    nonQuality: number;
    qualityRate: number;
    bookedRate: number;
    attendedRate: number;
    wonRate: number;
  };
}) {
  const fmt = (value: number, digits = 0) =>
    value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return (
    <section className="card-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Zanjir xulosasi
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold">Manba → sifat → natija</h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Kunlik operator kataklaridan yig'iladi. Jami va foizlar qo'lda kiritilmaydi.
          </p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          Sabab qatorlari va funnel qatorlari alohida hisoblanadi
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Metric label="Lidlar" value={fmt(totals.leads)} />
        <Metric label="Sifatli" value={fmt(totals.quality)} tone="text-success" />
        <Metric label="Qabulga keldi" value={fmt(totals.booked)} />
        <Metric label="Qatnadi" value={fmt(totals.attended)} />
        <Metric label="Yotdi" value={fmt(totals.won)} tone="text-primary" />
        <Metric label="Sifatli %" value={`${fmt(totals.qualityRate, 1)}%`} />
        <Metric label="Qabul / sifatli" value={`${fmt(totals.bookedRate, 1)}%`} />
        <Metric label="Yotdi / qatnadi" value={`${fmt(totals.wonRate, 1)}%`} />
      </div>
    </section>
  );
}

export function LeadReportChainTable({
  daily,
}: {
  daily: Array<{
    leads: number;
    quality: number;
    booked: number;
    attended: number;
    won: number;
    qualityRate: number;
    bookedRate: number;
    attendedRate: number;
    wonRate: number;
  }>;
}) {
  const fmt = (value: number, digits = 0) =>
    value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Kunlik zanjir
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold">Funnel oqimi</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="bg-secondary/35 text-left text-xs text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 bg-secondary/80 px-4 py-3 font-medium">Kun</th>
              <th className="px-3 py-3 font-medium">Lidlar</th>
              <th className="px-3 py-3 font-medium">Sifatli</th>
              <th className="px-3 py-3 font-medium">Qabul</th>
              <th className="px-3 py-3 font-medium">Qatnadi</th>
              <th className="px-3 py-3 font-medium">Yotdi</th>
              <th className="px-3 py-3 font-medium">Sifatli %</th>
              <th className="px-3 py-3 font-medium">Yotdi %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {daily.map((day, index) => (
              <tr key={index} className="hover:bg-secondary/20">
                <td className="sticky left-0 z-10 bg-card px-4 py-2 font-medium text-muted-foreground">
                  {index + 1}
                </td>
                <td className="px-3 py-2">{fmt(day.leads)}</td>
                <td className="px-3 py-2 text-success">{fmt(day.quality)}</td>
                <td className="px-3 py-2">{fmt(day.booked)}</td>
                <td className="px-3 py-2">{fmt(day.attended)}</td>
                <td className="px-3 py-2 font-semibold text-primary">{fmt(day.won)}</td>
                <td className="px-3 py-2 text-muted-foreground">{fmt(day.qualityRate, 1)}%</td>
                <td className="px-3 py-2 text-muted-foreground">{fmt(day.wonRate, 1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function LeadReportOperatorTable({
  operator,
  leads,
  onChange,
  onDelete,
}: {
  operator: LeadReportOperator;
  leads: number;
  onChange: (rowId: string, day: number, value: number) => void;
  onDelete?: () => void;
}) {
  const totals = calculateOperatorTotals(operator);
  const fmt = (value: number, digits = 0) =>
    value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  let previousGroup = "";

  return (
    <section className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">{operator.name}</h2>
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {fmt(totals.leads)} lid
            </span>
          </div>
          {operator.sourceNote ? (
            <p className="mt-1 text-xs text-warning">{operator.sourceNote}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Manba qatorlari saqlandi; jami va foizlar avtomatik.
            </p>
          )}
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> O'chirish
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1460px] w-full border-collapse text-xs">
          <thead className="bg-secondary/35 text-left text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 min-w-[180px] bg-secondary/90 px-4 py-3 font-medium">
                Status / sabab
              </th>
              <th className="sticky left-[180px] z-20 min-w-[90px] bg-secondary/90 px-3 py-3 text-right font-medium">
                Oylik jami
              </th>
              <th className="sticky left-[270px] z-20 min-w-[76px] bg-secondary/90 px-3 py-3 text-right font-medium">
                %
              </th>
              {Array.from({ length: operator.rows[0]?.values.length ?? 30 }, (_, day) => (
                <th key={day} className="min-w-[47px] px-2 py-3 text-center font-medium">
                  {day + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operator.rows.map((row) => {
              const group = statusGroup(row.label);
              const showGroup = group !== previousGroup;
              previousGroup = group;
              return (
                <Fragment key={row.id}>
                  {showGroup ? (
                    <tr className="bg-secondary/20">
                      <td
                        colSpan={3 + row.values.length}
                        className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
                      >
                        {group}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-t border-border/50 hover:bg-secondary/15">
                    <td className="sticky left-0 z-10 bg-card px-4 py-1.5 font-medium text-foreground">
                      {row.label}
                    </td>
                    <td className="sticky left-[180px] z-10 bg-card px-3 py-1.5 text-right font-semibold text-muted-foreground">
                      {fmt(rowTotal(row))}
                    </td>
                    <td className="sticky left-[270px] z-10 bg-card px-3 py-1.5 text-right text-muted-foreground">
                      {fmt(rowShare(row, leads), 1)}%
                    </td>
                    {row.values.map((value, day) => (
                      <td key={`${row.id}-${day}`} className="px-1 py-1">
                        <input
                          aria-label={`${operator.name}, ${row.label}, ${day + 1}-kun`}
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={value === 0 ? "" : value}
                          placeholder="—"
                          onChange={(event) =>
                            onChange(row.id, day, numberValue(event.target.value))
                          }
                          className="h-7 w-11 rounded border border-border/70 bg-secondary/35 px-1 text-center text-xs outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:bg-primary/10"
                        />
                      </td>
                    ))}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function LeadReportAddButton({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
    >
      <Plus className="h-4 w-4" /> Operator qo'shish
    </button>
  );
}
