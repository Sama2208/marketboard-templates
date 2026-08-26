import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LogOut, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/marketboard/BrandMark";
import { ClientBar } from "@/components/marketboard/ClientBar";
import {
  LeadReportAddButton,
  LeadReportChainTable,
  LeadReportOperatorTable,
  LeadReportSummary,
} from "@/components/marketboard/LeadReportTable";
import { useAuth } from "@/hooks/use-auth";
import {
  createCustomLeadReportOperator,
  createLeadReport,
  dailyStageTotals,
  leadReportTotals,
  type LeadReportData,
} from "@/lib/lead-report";
import {
  deleteLeadReportRemote,
  loadLeadReportRemote,
  saveLeadReportRemote,
} from "@/lib/supabase/leadReportStore";
import {
  addClient,
  deleteClient,
  listClients,
  renameClient,
  type Client,
} from "@/lib/supabase/clients";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/templates/lead-report")({
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
      { title: "Lidlar bo'yicha to'liq hisobot — MarketBoard" },
      {
        name: "description",
        content:
          "Samandar Pre Sale sahifasidan ko'chirilgan operator, status va kunlik lidlar hisoboti.",
      },
    ],
  }),
  component: LeadReportPage,
});

const now = new Date();
const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
const monthNames = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

function LeadReportPage() {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientsReady, setClientsReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [report, setReport] = useState<LeadReportData>(() => createLeadReport(30));
  const [loadingReport, setLoadingReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        let list = await listClients();
        if (list.length === 0) list = [await addClient("Asosiy mijoz")];
        setClients(list);
        setClientId(list[0]?.id ?? null);
      } catch (error) {
        console.error("Mijozlarni yuklashda xatolik", error);
      } finally {
        setClientsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (clientsReady && !clientId) setLoadingReport(false);
  }, [clientId, clientsReady]);

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    setLoadingReport(true);
    (async () => {
      try {
        const remote = await loadLeadReportRemote(clientId, year, month);
        if (active) setReport(remote ?? createLeadReport(30));
      } catch (error) {
        console.error("Lidlar hisobotini yuklashda xatolik", error);
        if (active) setReport(createLeadReport(30));
      } finally {
        if (active) setLoadingReport(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [clientId, month, year]);

  const scheduleSave = useCallback(
    (next: LeadReportData) => {
      if (!clientId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaving(true);
      const cid = clientId;
      const y = year;
      const m = month;
      saveTimer.current = setTimeout(async () => {
        try {
          await saveLeadReportRemote(cid, y, m, next);
        } catch (error) {
          console.error("Lidlar hisobotini saqlashda xatolik", error);
        } finally {
          setSaving(false);
        }
      }, 650);
    },
    [clientId, month, year],
  );

  const updateReport = useCallback(
    (updater: (previous: LeadReportData) => LeadReportData) => {
      setReport((previous) => {
        const next = updater(previous);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const onChange = (operatorId: string, rowId: string, day: number, value: number) => {
    updateReport((previous) => ({
      ...previous,
      operators: previous.operators.map((operator) =>
        operator.id !== operatorId
          ? operator
          : {
              ...operator,
              rows: operator.rows.map((row) =>
                row.id !== rowId
                  ? row
                  : {
                      ...row,
                      values: row.values.map((current, index) => (index === day ? value : current)),
                    },
              ),
            },
      ),
    }));
  };

  const onAddOperator = () => {
    const name = window.prompt("Operator nomi:", "");
    if (name === null) return;
    const operator = createCustomLeadReportOperator(name, report.days);
    updateReport((previous) => ({ ...previous, operators: [...previous.operators, operator] }));
  };

  const onDeleteOperator = (operatorId: string) => {
    const operator = report.operators.find((item) => item.id === operatorId);
    if (!operator || !window.confirm(`"${operator.name}" blokini o'chirasizmi?`)) return;
    updateReport((previous) => ({
      ...previous,
      operators: previous.operators.filter((item) => item.id !== operatorId),
    }));
  };

  const onClear = async () => {
    if (!clientId || loadingReport) return;
    const clientName = clients.find((client) => client.id === clientId)?.name ?? "mijoz";
    if (!window.confirm(`"${clientName}" uchun lidlar hisobotini tozalaysizmi?`)) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    try {
      await deleteLeadReportRemote(clientId, year, month);
      setReport(createLeadReport(30));
    } catch (error) {
      console.error("Lidlar hisobotini o'chirishda xatolik", error);
      window.alert("Hisobot tozalanmadi. Qayta urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  const onAddClient = async () => {
    const name = window.prompt("Yangi mijoz nomi:", "");
    if (name === null) return;
    setBusy(true);
    try {
      const client = await addClient(name);
      setClients((previous) => [...previous, client]);
      setClientId(client.id);
    } catch (error) {
      console.error(error);
      window.alert("Mijoz qo'shilmadi. Qayta urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  };

  const onRenameClient = async () => {
    if (!clientId) return;
    const current = clients.find((client) => client.id === clientId);
    const name = window.prompt("Yangi nom:", current?.name ?? "");
    if (name === null) return;
    setBusy(true);
    try {
      await renameClient(clientId, name);
      setClients((previous) =>
        previous.map((client) =>
          client.id === clientId ? { ...client, name: name.trim() || client.name } : client,
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const onDeleteClient = async () => {
    if (!clientId) return;
    const current = clients.find((client) => client.id === clientId);
    if (!window.confirm(`"${current?.name ?? "mijoz"}" va uning hisobotlarini o'chirasizmi?`))
      return;
    setBusy(true);
    try {
      await deleteClient(clientId);
      const remaining = clients.filter((client) => client.id !== clientId);
      setClients(remaining);
      setClientId(remaining[0]?.id ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const totals = leadReportTotals(report);
  const selectedClientName = clients.find((client) => client.id === clientId)?.name ?? "Mijoz";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <BrandMark className="mb-5" />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Shablonlar
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Lidlar bo'yicha to'liq hisobot
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Samandar sahifasidagi operatorlar, statuslar va 30 kunlik zanjir — jami va foizlar
              avtomatik.
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
            <Link
              to="/templates/rnp"
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              RNP Tracker
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </button>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {monthNames.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </header>

        <ClientBar
          clients={clients}
          selectedId={clientId}
          onSelect={setClientId}
          onAdd={onAddClient}
          onRename={onRenameClient}
          onDelete={onDeleteClient}
          busy={busy}
        />

        {!clientsReady || loadingReport ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Yuklanmoqda…
          </div>
        ) : clients.length === 0 ? (
          <div className="card-surface py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Hisobotni boshlash uchun avval yuqoridagi{" "}
              <span className="text-foreground">"Yangi mijoz"</span> tugmasini bosing.
            </p>
          </div>
        ) : (
          <>
            <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {selectedClientName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {monthNames[month]} {year} · 30 kunlik manba format
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LeadReportAddButton onAdd={onAddOperator} />
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Hisobotni tozalash
                </button>
              </div>
            </div>

            <LeadReportSummary totals={totals} />
            <LeadReportChainTable daily={dailyStageTotals(report)} />

            <div className="space-y-5">
              {report.operators.map((operator) => (
                <LeadReportOperatorTable
                  key={operator.id}
                  operator={operator}
                  leads={totals.leads}
                  onChange={(rowId, day, value) => onChange(operator.id, rowId, day, value)}
                  onDelete={() => onDeleteOperator(operator.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
