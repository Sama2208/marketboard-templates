import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, type ChangeEvent } from "react";
import { PieChart, Plus, Target } from "lucide-react";
import { TemplatePageShell } from "@/components/marketboard/TemplatePageShell";
import { useAuth } from "@/hooks/use-auth";
import { useTemplateStorage } from "@/hooks/use-template-storage";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/templates/budget-planner")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Budjet Planner — MarketBoard" }] }),
  component: BudgetPlannerPage,
});

type Channel = { id: string; name: string; share: number };
type BudgetState = { monthlyBudget: number; targetCpl: number; channels: Channel[] };

const initialState: BudgetState = {
  monthlyBudget: 1200,
  targetCpl: 2,
  channels: [
    { id: "meta", name: "Meta Ads", share: 60 },
    { id: "google", name: "Google Ads", share: 25 },
    { id: "tiktok", name: "TikTok Ads", share: 15 },
  ],
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:border-primary";

function BudgetPlannerPage() {
  const { user } = useAuth();
  const [state, setState] = useTemplateStorage("budget-planner", user?.id, initialState);
  const totalShare = useMemo(
    () => state.channels.reduce((total, channel) => total + channel.share, 0),
    [state.channels],
  );
  const totalBudget = state.monthlyBudget;
  const projectedLeads = state.targetCpl > 0 ? totalBudget / state.targetCpl : 0;

  const updateNumber =
    (key: "monthlyBudget" | "targetCpl") => (event: ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, [key]: Math.max(0, Number(event.target.value) || 0) }));
    };

  const updateShare = (id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      channels: prev.channels.map((channel) =>
        channel.id === id ? { ...channel, share: Math.max(0, value) } : channel,
      ),
    }));
  };

  const addChannel = () => {
    const id = `channel-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      channels: [...prev.channels, { id, name: "Yangi kanal", share: 0 }],
    }));
  };

  const updateName = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      channels: prev.channels.map((channel) =>
        channel.id === id ? { ...channel, name } : channel,
      ),
    }));
  };

  return (
    <TemplatePageShell
      title="Budjet Planner"
      description="Oylik reklama budjetini kanallar bo‘yicha taqsimlang va kutilayotgan lead hajmini ko‘ring."
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="card-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Asosiy parametrlar</h2>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block text-xs font-medium text-muted-foreground">
              Oylik budjet ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.monthlyBudget}
                onChange={updateNumber("monthlyBudget")}
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Maqsadli CPL ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.targetCpl}
                onChange={updateNumber("targetCpl")}
                className={inputClass}
              />
            </label>
            <div
              className={`rounded-lg border px-3 py-3 text-sm ${totalShare === 100 ? "border-success/40 bg-success/10" : "border-warning/50 bg-warning/10"}`}
            >
              <div className="flex items-center justify-between">
                <span>Ajratish yig‘indisi</span>
                <strong>{totalShare}%</strong>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalShare === 100
                  ? "Budjet to‘liq taqsimlangan."
                  : "Aniq reja uchun yig‘indi 100% bo‘lishi kerak."}
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Kanallar taqsimoti</h2>
            </div>
            <button
              type="button"
              onClick={addChannel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/60 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Kanal qo‘shish
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-secondary/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Kanal</th>
                  <th className="px-3 py-3 font-medium">Ulush %</th>
                  <th className="px-3 py-3 font-medium">Budjet</th>
                  <th className="px-5 py-3 font-medium">Kutilgan lead</th>
                </tr>
              </thead>
              <tbody>
                {state.channels.map((channel) => {
                  const allocation = totalBudget * (channel.share / 100);
                  const leads = state.targetCpl > 0 ? allocation / state.targetCpl : 0;
                  return (
                    <tr key={channel.id} className="border-t border-border">
                      <td className="px-5 py-3">
                        <input
                          value={channel.name}
                          onChange={(event) => updateName(channel.id, event.target.value)}
                          className="w-full rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          value={channel.share}
                          onChange={(event) =>
                            updateShare(channel.id, Number(event.target.value) || 0)
                          }
                          className="w-24 rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-3 font-medium">${allocation.toFixed(2)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{leads.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Jami budjet</p>
          <p className="mt-2 font-display text-3xl font-bold">${totalBudget.toFixed(2)}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Kutilgan lead</p>
          <p className="mt-2 font-display text-3xl font-bold">{projectedLeads.toFixed(0)}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Budjet rejasi ushbu hisobga kirgan foydalanuvchi uchun brauzerda saqlanadi.
      </p>
    </TemplatePageShell>
  );
}
