import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Calculator, DollarSign, Percent, Users } from "lucide-react";
import { TemplatePageShell } from "@/components/marketboard/TemplatePageShell";
import { useAuth } from "@/hooks/use-auth";
import { useTemplateStorage } from "@/hooks/use-template-storage";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/templates/cpl-cpa")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "CPL / CPA Kalkulyator — MarketBoard" }] }),
  component: CplCpaPage,
});

type CplCpaState = {
  spend: number;
  leads: number;
  qualifiedLeads: number;
  sales: number;
  revenue: number;
};

const initialState: CplCpaState = {
  spend: 1200,
  leads: 800,
  qualifiedLeads: 480,
  sales: 76,
  revenue: 0,
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:border-primary";

function money(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function CplCpaPage() {
  const { user } = useAuth();
  const [values, setValues] = useTemplateStorage("cpl-cpa", user?.id, initialState);
  const metrics = useMemo(() => {
    const cpl = values.leads > 0 ? values.spend / values.leads : 0;
    const cpql = values.qualifiedLeads > 0 ? values.spend / values.qualifiedLeads : 0;
    const cpa = values.sales > 0 ? values.spend / values.sales : 0;
    const leadToSale = values.leads > 0 ? (values.sales / values.leads) * 100 : 0;
    const roas = values.spend > 0 ? values.revenue / values.spend : 0;
    return { cpl, cpql, cpa, leadToSale, roas };
  }, [values]);

  const setNumber = (key: keyof CplCpaState) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: Math.max(0, Number(event.target.value) || 0) }));
  };

  return (
    <TemplatePageShell
      title="CPL / CPA Kalkulyator"
      description="Reklama sarfi, leadlar va sotuvlar asosida asosiy marketing KPI'larini tez hisoblang."
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="card-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Kirish ma'lumotlari</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <label className="text-xs font-medium text-muted-foreground">
              Reklama sarfi ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.spend}
                onChange={setNumber("spend")}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              Leadlar
              <input
                type="number"
                min="0"
                value={values.leads}
                onChange={setNumber("leads")}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              Sifatli leadlar
              <input
                type="number"
                min="0"
                value={values.qualifiedLeads}
                onChange={setNumber("qualifiedLeads")}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              Sotuvlar
              <input
                type="number"
                min="0"
                value={values.sales}
                onChange={setNumber("sales")}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground sm:col-span-2 lg:col-span-1">
              Tushum ($, ixtiyoriy)
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.revenue}
                onChange={setNumber("revenue")}
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            label="CPL"
            value={money(metrics.cpl)}
            hint="1 ta lead narxi"
          />
          <MetricCard
            icon={<Users className="h-4 w-4" />}
            label="CPQL"
            value={money(metrics.cpql)}
            hint="1 ta sifatli lead narxi"
          />
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            label="CPA"
            value={money(metrics.cpa)}
            hint="1 ta sotuv narxi"
          />
          <MetricCard
            icon={<Percent className="h-4 w-4" />}
            label="Lead → Sotuv"
            value={`${metrics.leadToSale.toFixed(1)}%`}
            hint={`ROAS ${metrics.roas.toFixed(2)}x`}
          />
        </div>
      </section>
      <p className="text-xs text-muted-foreground">
        Ma'lumotlar ushbu hisobga kirgan foydalanuvchi uchun brauzerda saqlanadi.
      </p>
    </TemplatePageShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className="mt-5 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
