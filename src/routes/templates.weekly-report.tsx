import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, FileText, Trash2 } from "lucide-react";
import { TemplatePageShell } from "@/components/marketboard/TemplatePageShell";
import { useAuth } from "@/hooks/use-auth";
import { useTemplateStorage } from "@/hooks/use-template-storage";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/templates/weekly-report")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Haftalik Hisobot — MarketBoard" }] }),
  component: WeeklyReportPage,
});

type Metrics = { budget: number; leads: number; qualifiedLeads: number; sales: number };
type WeeklyState = { client: string; period: string; current: Metrics; previous: Metrics };

const initialState: WeeklyState = {
  client: "Asosiy mijoz",
  period: "2026-08-17 — 2026-08-23",
  current: { budget: 300, leads: 180, qualifiedLeads: 105, sales: 18 },
  previous: { budget: 280, leads: 160, qualifiedLeads: 92, sales: 14 },
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:border-primary";
const metricLabels: Array<[keyof Metrics, string]> = [
  ["budget", "Budjet ($)"],
  ["leads", "Leadlar"],
  ["qualifiedLeads", "Sifatli leadlar"],
  ["sales", "Sotuvlar"],
];

function WeeklyReportPage() {
  const { user } = useAuth();
  const [state, setState] = useTemplateStorage("weekly-report", user?.id, initialState);
  const summary = useMemo(() => {
    const cpl = state.current.leads > 0 ? state.current.budget / state.current.leads : 0;
    const cpa = state.current.sales > 0 ? state.current.budget / state.current.sales : 0;
    const leadDelta = delta(state.current.leads, state.previous.leads);
    const salesDelta = delta(state.current.sales, state.previous.sales);
    return { cpl, cpa, leadDelta, salesDelta };
  }, [state]);

  const updateText = (key: "client" | "period", value: string) =>
    setState((prev) => ({ ...prev, [key]: value }));
  const updateMetric = (period: "current" | "previous", key: keyof Metrics, value: number) => {
    setState((prev) => ({ ...prev, [period]: { ...prev[period], [key]: Math.max(0, value) } }));
  };

  const handleClear = () => {
    if (window.confirm("Haftalik hisobot ma'lumotlarini boshlang'ich holatga qaytarasizmi?")) {
      setState(initialState);
    }
  };

  return (
    <TemplatePageShell
      title="Haftalik Hisobot"
      description="Mijozga yuborishga tayyor haftalik marketing natijalari va qisqa xulosani tayyorlang."
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="card-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Hisobot ma'lumotlari</h2>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/50 px-2.5 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Tozalash
            </button>
          </div>
          <label className="mt-5 block text-xs font-medium text-muted-foreground">
            Mijoz nomi
            <input
              value={state.client}
              onChange={(event) => updateText("client", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="mt-4 block text-xs font-medium text-muted-foreground">
            Hisobot davri
            <input
              value={state.period}
              onChange={(event) => updateText("period", event.target.value)}
              className={inputClass}
            />
          </label>
          <p className="mt-5 rounded-lg bg-secondary/50 p-3 text-sm leading-relaxed text-muted-foreground">
            {state.client || "Mijoz"} uchun {state.period || "tanlangan davr"} hisobotida{" "}
            {summary.leadDelta >= 0 ? "leadlar o‘sdi" : "leadlar kamaydi"} va{" "}
            {summary.salesDelta >= 0 ? "sotuvlar yaxshilandi" : "sotuvlar pasaydi"}.
          </p>
        </div>

        <div className="card-surface overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-border bg-secondary/50 px-5 py-3 text-xs font-semibold text-muted-foreground">
            <span>Ko‘rsatkich</span>
            <span>Bu hafta</span>
            <span>O‘tgan hafta</span>
          </div>
          {metricLabels.map(([key, label]) => (
            <div
              key={key}
              className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-3 border-b border-border px-5 py-3 last:border-b-0"
            >
              <span className="text-sm">{label}</span>
              <input
                type="number"
                min="0"
                step={key === "budget" ? "0.01" : "1"}
                value={state.current[key]}
                onChange={(event) => updateMetric("current", key, Number(event.target.value) || 0)}
                className="w-full rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                type="number"
                min="0"
                step={key === "budget" ? "0.01" : "1"}
                value={state.previous[key]}
                onChange={(event) => updateMetric("previous", key, Number(event.target.value) || 0)}
                className="w-full rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard label="CPL" value={`$${summary.cpl.toFixed(2)}`} />
        <ReportCard label="CPA" value={`$${summary.cpa.toFixed(2)}`} />
        <ReportCard
          label="Leadlar dinamikasi"
          value={`${summary.leadDelta >= 0 ? "+" : ""}${summary.leadDelta.toFixed(1)}%`}
          positive={summary.leadDelta >= 0}
        />
        <ReportCard
          label="Sotuvlar dinamikasi"
          value={`${summary.salesDelta >= 0 ? "+" : ""}${summary.salesDelta.toFixed(1)}%`}
          positive={summary.salesDelta >= 0}
        />
      </section>
      <p className="text-xs text-muted-foreground">
        Hisobot ma'lumotlari ushbu hisobga kirgan foydalanuvchi uchun brauzerda saqlanadi.
      </p>
    </TemplatePageShell>
  );
}

function delta(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
}

function ReportCard({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="card-surface p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-center gap-2 font-display text-2xl font-bold">
        {positive === undefined ? null : positive ? (
          <ArrowUpRight className="h-5 w-5 text-success" />
        ) : (
          <ArrowDownRight className="h-5 w-5 text-danger" />
        )}
        {value}
      </div>
    </div>
  );
}
