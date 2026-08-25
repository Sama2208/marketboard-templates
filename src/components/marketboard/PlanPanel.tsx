import type { PlanSettings } from "@/lib/rnp";
import { fmt, planFunnel } from "@/lib/rnp";

const fields: { key: keyof PlanSettings; label: string; suffix?: string }[] = [
  { key: "leadGoal", label: "Lead maqsadi" },
  { key: "qlRate", label: "Q.Lead konversiya", suffix: "%" },
  { key: "zapRate", label: "Yozildi konversiya", suffix: "%" },
  { key: "comeRate", label: "Keldi konversiya", suffix: "%" },
  { key: "wonRate", label: "Yotdi konversiya", suffix: "%" },
  { key: "budget", label: "Oylik budjet", suffix: "$" },
  { key: "workDays", label: "Ish kunlari" },
];

export function PlanPanel({
  plan,
  onChange,
}: {
  plan: PlanSettings;
  onChange: (plan: PlanSettings) => void;
}) {
  const pf = planFunnel(plan);
  const stages = [
    { label: "Lead", value: pf.lead },
    { label: "Q.Lead", value: pf.qlead },
    { label: "Yozildi", value: pf.zapisan },
    { label: "Keldi", value: pf.keldi },
    { label: "Yotdi", value: pf.yotdi },
  ];

  return (
    <section className="card-surface p-5">
      <h2 className="font-display text-base font-semibold">Oylik reja (PLAN)</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted-foreground">
              {f.label}
              {f.suffix ? ` ${f.suffix}` : ""}
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={plan[f.key]}
              onChange={(e) =>
                onChange({ ...plan, [f.key]: Number(e.target.value) || 0 } as PlanSettings)
              }
              className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stages.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-xs text-muted-foreground">{s.label} (reja)</p>
            <p className="mt-1 font-display text-lg font-bold">{fmt(s.value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
