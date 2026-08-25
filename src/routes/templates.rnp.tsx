import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DailyTable } from "@/components/marketboard/DailyTable";
import { PlanPanel } from "@/components/marketboard/PlanPanel";
import { RnpCharts } from "@/components/marketboard/RnpCharts";
import { StatCard } from "@/components/marketboard/StatCard";
import type { DayRow, MonthData, PlanSettings } from "@/lib/rnp";
import {
  createMonthData,
  fmt,
  loadMonth,
  monthNames,
  planFunnel,
  saveMonth,
  totals,
} from "@/lib/rnp";

export const Route = createFileRoute("/templates/rnp")({
  // Session localStorage'da saqlanadi — shu sababli gate faqat brauzerda ishlaydi.
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "RNP Funnel Tracker — MarketBoard" },
      {
        name: "description",
        content:
          "Meta Ads lead funnelini kunlik plan/fakt bo'yicha kuzatish: CPL, CPQL, indekslar va grafiklar.",
      },
      { property: "og:title", content: "RNP Funnel Tracker — MarketBoard" },
      {
        property: "og:description",
        content: "Kunlik lead funnel nazorati: CPL, CPQL, konversiyalar va indekslar.",
      },
    ],
  }),
  component: RnpPage,
});

const now = new Date();
const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

function RnpPage() {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();

  // Session tugasa (masalan boshqa tabda chiqilsa) — login sahifasiga qaytarish
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData] = useState<MonthData>(() => createMonthData(year, month));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    setData(loadMonth(year, month));
    setReady(true);
  }, [year, month]);

  useEffect(() => {
    if (ready) saveMonth(year, month, data);
  }, [ready, year, month, data]);

  const onChangeRow = useCallback((day: number, key: keyof DayRow, value: number) => {
    setData((prev) => ({
      ...prev,
      days: prev.days.map((r) => (r.day === day ? { ...r, [key]: value } : r)),
    }));
  }, []);

  const onChangePlan = useCallback((plan: PlanSettings) => {
    setData((prev) => ({ ...prev, plan }));
  }, []);

  const t = totals(data);
  const pf = planFunnel(data.plan);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Shablonlar
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              RNP Funnel Tracker
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Meta Ads lead funnelini kunlik plan/fakt bo'yicha kuzatish
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <PlanPanel plan={data.plan} onChange={onChangePlan} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Sarflangan budjet" value={`$${fmt(t.budget)}`} hint={`reja $${fmt(data.plan.budget)}`} />
          <StatCard
            label="Leadlar"
            value={`${fmt(t.lead)} / ${fmt(pf.lead)}`}
            hint={`CPL $${fmt(t.cpl, 2)}`}
            index={t.leadIndex}
          />
          <StatCard
            label="Q.Leadlar"
            value={`${fmt(t.qlTotal)} / ${fmt(pf.qlead)}`}
            hint={`CPQL $${fmt(t.cpql, 2)}`}
            index={t.qlIndex}
          />
          <StatCard
            label="Yotdi / Sotuv"
            value={`${fmt(t.yotdi)} / ${fmt(pf.yotdi)}`}
            hint={`CPA $${fmt(t.cpa, 2)}`}
            index={pf.yotdi > 0 ? (t.yotdi / pf.yotdi) * 100 : 0}
          />
          <StatCard label="Lead→Sotuv %" value={`${fmt(t.leadToSale, 1)}%`} hint="fakt" />
          <StatCard label="Q.Lead→Sotuv %" value={`${fmt(t.qlToSale, 1)}%`} hint="fakt" />
        </div>

        <RnpCharts data={data} />

        <DailyTable data={data} onChangeRow={onChangeRow} />
      </div>
    </main>
  );
}
