import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import {
  addClient,
  deleteClient,
  listClients,
  renameClient,
  type Client,
} from "@/lib/supabase/clients";
import { loadMonthRemote, saveMonthRemote } from "@/lib/supabase/rnpStore";
import { ClientBar } from "@/components/marketboard/ClientBar";
import { DailyTable } from "@/components/marketboard/DailyTable";
import { ExportBar } from "@/components/marketboard/ExportBar";
import { PlanPanel } from "@/components/marketboard/PlanPanel";
import { RnpCharts } from "@/components/marketboard/RnpCharts";
import { StatCard } from "@/components/marketboard/StatCard";
import type { DayRow, MonthData, PlanSettings } from "@/lib/rnp";
import { createMonthData, fmt, monthNames, planFunnel, totals } from "@/lib/rnp";

export const Route = createFileRoute("/templates/rnp")({
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
  const { subscription, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  // Mijozlar
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientsReady, setClientsReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sana
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // Ma'lumot
  const [data, setData] = useState<MonthData>(() => createMonthData(year, month));
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initRef = useRef(false);

  // Mijozlarni yuklash (bo'sh bo'lsa — birinchisini avtomatik yaratish).
  // initRef — StrictMode/ikki marta mount holatida dublikat mijoz yaratilishining oldini oladi.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        let list = await listClients();
        if (list.length === 0) {
          const c = await addClient("Asosiy mijoz");
          list = [c];
        }
        setClients(list);
        setClientId((prev) => prev ?? list[0]?.id ?? null);
      } catch (e) {
        console.error("Mijozlarni yuklashda xatolik", e);
      } finally {
        setClientsReady(true);
      }
    })();
  }, []);

  // Tanlangan mijoz + oy uchun ma'lumotni bazadan yuklash
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    setLoadingData(true);
    (async () => {
      try {
        const remote = await loadMonthRemote(clientId, year, month);
        if (!active) return;
        setData(remote ?? createMonthData(year, month));
      } catch (e) {
        console.error("Ma'lumot yuklashda xatolik", e);
        if (active) setData(createMonthData(year, month));
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [clientId, year, month]);

  // Debounce bilan bazaga saqlash (faqat foydalanuvchi tahrirlaganda chaqiriladi)
  const scheduleSave = useCallback(
    (next: MonthData) => {
      if (!clientId) return;
      const cid = clientId;
      const y = year;
      const m = month;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaving(true);
      saveTimer.current = setTimeout(async () => {
        try {
          await saveMonthRemote(cid, y, m, next);
        } catch (e) {
          console.error("Saqlashda xatolik", e);
        } finally {
          setSaving(false);
        }
      }, 700);
    },
    [clientId, year, month],
  );

  const onChangeRow = useCallback(
    (day: number, key: keyof DayRow, value: number) => {
      setData((prev) => {
        const next = {
          ...prev,
          days: prev.days.map((r) => (r.day === day ? { ...r, [key]: value } : r)),
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const onChangePlan = useCallback(
    (plan: PlanSettings) => {
      setData((prev) => {
        const next = { ...prev, plan };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  // Mijoz amallari
  const onAddClient = async () => {
    const name = window.prompt("Yangi mijoz nomi:", "");
    if (name === null) return;
    setBusy(true);
    try {
      const c = await addClient(name);
      setClients((prev) => [...prev, c]);
      setClientId(c.id);
    } catch (e) {
      console.error(e);
      window.alert("Mijoz qo'shilmadi. Qayta urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  };

  const onRenameClient = async () => {
    if (!clientId) return;
    const cur = clients.find((c) => c.id === clientId);
    const name = window.prompt("Yangi nom:", cur?.name ?? "");
    if (name === null) return;
    setBusy(true);
    try {
      await renameClient(clientId, name);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, name: name.trim() || c.name } : c)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const onDeleteClient = async () => {
    if (!clientId) return;
    const cur = clients.find((c) => c.id === clientId);
    if (
      !window.confirm(
        `"${cur?.name ?? "mijoz"}" mijozini va uning barcha RNP ma'lumotini o'chirasizmi?`,
      )
    )
      return;
    setBusy(true);
    try {
      await deleteClient(clientId);
      const rest = clients.filter((c) => c.id !== clientId);
      setClients(rest);
      setClientId(rest[0]?.id ?? null);
      if (rest.length === 0) setData(createMonthData(year, month));
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const t = totals(data);
  const pf = planFunnel(data.plan);
  const showLoader = !clientsReady;
  const selectedClientName = clients.find((client) => client.id === clientId)?.name ?? "Mijoz";

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
            {saving ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saqlanmoqda…
              </span>
            ) : (
              <span className="text-xs text-success">Saqlandi</span>
            )}
            {user?.email ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
            ) : null}
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {subscriptionLoading ? "…" : subscription.plan === "pro" ? "Pro" : "Free"}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </button>
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

        <ClientBar
          clients={clients}
          selectedId={clientId}
          onSelect={setClientId}
          onAdd={onAddClient}
          onRename={onRenameClient}
          onDelete={onDeleteClient}
          busy={busy}
        />

        {showLoader ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Yuklanmoqda…
          </div>
        ) : clients.length === 0 ? (
          <div className="card-surface py-16 text-center text-muted-foreground">
            Hali mijoz yo'q. Yuqoridagi <span className="text-foreground">"Yangi mijoz"</span>{" "}
            tugmasi bilan qo'shing.
          </div>
        ) : (
          <div className={loadingData ? "pointer-events-none opacity-60" : ""}>
            <ExportBar
              data={data}
              clientName={selectedClientName}
              year={year}
              month={month}
              disabled={loadingData || saving}
            />
            <PlanPanel plan={data.plan} onChange={onChangePlan} />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

            <div className="mt-5">
              <RnpCharts data={data} />
            </div>

            <div className="mt-5">
              <DailyTable data={data} onChangeRow={onChangeRow} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
