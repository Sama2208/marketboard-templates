import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { TemplatePageShell } from "@/components/marketboard/TemplatePageShell";
import { useAuth } from "@/hooks/use-auth";
import { useTemplateStorage } from "@/hooks/use-template-storage";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/templates/content-calendar")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Kontent Kalendar — MarketBoard" }] }),
  component: ContentCalendarPage,
});

type Status = "Reja" | "Tayyor" | "E'lon qilindi";
type CalendarItem = {
  id: string;
  date: string;
  platform: string;
  format: string;
  topic: string;
  status: Status;
};

const today = new Date().toISOString().slice(0, 10);
const initialItems: CalendarItem[] = [
  {
    id: "post-1",
    date: today,
    platform: "Instagram",
    format: "Reels",
    topic: "Haftaning asosiy maslahati",
    status: "Reja",
  },
  {
    id: "post-2",
    date: today,
    platform: "Telegram",
    format: "Post",
    topic: "Mijoz savoliga javob",
    status: "Tayyor",
  },
];
const platforms = ["Instagram", "Telegram", "Facebook", "LinkedIn", "TikTok"];
const formats = ["Post", "Reels", "Story", "Video", "Email"];
const statuses: Status[] = ["Reja", "Tayyor", "E'lon qilindi"];
const cellClass =
  "rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-sm outline-none focus:border-primary";

function ContentCalendarPage() {
  const { user } = useAuth();
  const [items, setItems] = useTemplateStorage("content-calendar", user?.id, initialItems);
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.date.localeCompare(b.date)),
    [items],
  );

  const updateItem = (id: string, patch: Partial<CalendarItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `post-${Date.now()}`,
        date: today,
        platform: "Instagram",
        format: "Post",
        topic: "Yangi kontent g‘oyasi",
        status: "Reja",
      },
    ]);
  };
  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <TemplatePageShell
      title="Kontent Kalendar"
      description="Platformalar, formatlar va e'lon holatini bir oylik kontent rejasida boshqaring."
    >
      <section className="card-surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Kontent rejasi</h2>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Qator qo‘shish
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-secondary/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Sana</th>
                <th className="px-3 py-3 font-medium">Platforma</th>
                <th className="px-3 py-3 font-medium">Format</th>
                <th className="px-3 py-3 font-medium">Mavzu</th>
                <th className="px-3 py-3 font-medium">Holat</th>
                <th className="px-5 py-3 font-medium">Amal</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id} className="border-t border-border align-middle">
                  <td className="px-5 py-3">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(event) => updateItem(item.id, { date: event.target.value })}
                      className={cellClass}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={item.platform}
                      onChange={(event) => updateItem(item.id, { platform: event.target.value })}
                      className={cellClass}
                    >
                      {platforms.map((platform) => (
                        <option key={platform}>{platform}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={item.format}
                      onChange={(event) => updateItem(item.id, { format: event.target.value })}
                      className={cellClass}
                    >
                      {formats.map((format) => (
                        <option key={format}>{format}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      value={item.topic}
                      onChange={(event) => updateItem(item.id, { topic: event.target.value })}
                      className={`${cellClass} min-w-[260px]`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateItem(item.id, { status: event.target.value as Status })
                      }
                      className={cellClass}
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      aria-label="Qatorni o‘chirish"
                      onClick={() => removeItem(item.id)}
                      className="rounded-md border border-border p-2 text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Kalendar bo‘sh. Yangi qator qo‘shing.
          </p>
        ) : null}
      </section>
      <p className="text-xs text-muted-foreground">
        Kontent rejasi ushbu hisobga kirgan foydalanuvchi uchun brauzerda saqlanadi.
      </p>
    </TemplatePageShell>
  );
}
