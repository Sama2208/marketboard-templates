import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { loadRnpMonth, saveRnpMonth } from "@/lib/rnp-storage";
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
  normalizeMonthData,
  planFunnel,
  saveMonth,
  totals,
} from "@/lib/rnp";

export const Route = createFileRoute("/templates/rnp")({
  // Session localStorage'da saqlanadi — shu sababli gate faqat brauzerda ishlaydi.
  ssr: false,
  beforeLoad: async () => {
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = Boolean(data.session);
    } catch {
      hasSession = false;
    }
    if (!hasSession) throw redirect({ to: "/login" });
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
  const [dataReady, setDataReady] = useState(false);
  const [syncState, setSyncState] = useState<"loading" | "ready" | "saving" | "saved" | "error">(
    "loading",
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    let active = true;
    setDataReady(false);
    setSyncState("loading");
    setSyncError(null);

    const localData = loadMonth(year, month, userId);
    setData(localData);

    if (!userId)
      return () => {
        active = false;
      };

    void loadRnpMonth(userId, year, month)
      .then((remoteData) => {
        if (!active) return;
        if (remoteData) setData(normalizeMonthData(year, month, remoteData));
        setDataReady(true);
        setSyncState("ready");
      })
      .catch(() => {
        if (!active) return;
        setSyncError("Bulutdagi ma'lumotni yuklab bo'lmadi. Mahalliy nusxa ko'rsatilmoqda.");
        setSyncState("error");
      });

    return () => {
      active = false;
    };
  }, [month, userId, year]);

  useEffect(() => {
    if (!dataReady || !userId) return;

    let active = true;
    const timer = window.setTimeout(() => {
      setSyncState("saving");
      saveMonth(year, month, data, userId);
      void saveRnpMonth(userId, year, month, data)
        .then(() => {
          if (active) {
            setSyncError(null);
            setSyncState("saved");
          }
        })
        .catch(() => {
          if (active) {
            setSyncError("Bulutga saqlashda xatolik. Ma'lumot brauzerda ham saqlandi.");
            setSyncState("error");
          }
        });
    }, 700);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [data, dataReady, month, userId, year]);

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
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">RNP Funnel Tracker</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Meta Ads lead funnelini kunlik plan/fakt bo'yicha kuzatish
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user?.email ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </button>
            <span
              className={`text-xs ${syncState === "error" ? "text-destructive" : "text-muted-foreground"}`}
              title={syncError ?? undefined}
            >
              {syncState === "loading"
                ? "Yuklanmoqda…"
                : syncState === "saving"
                  ? "Saqlanmoqda…"
                  : syncState === "error"
                    ? "Sinxronlash xatosi"
                    : "Bulutga saqlandi"}
            </span>
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
          <StatCard
            label="Sarflangan budjet"
            value={`$${fmt(t.budget)}`}
            hint={`reja $${fmt(data.plan.budget)}`}
          />
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
