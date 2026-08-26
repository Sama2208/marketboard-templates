import { supabase } from "./client";
import { createLeadReport, normalizeLeadReport, type LeadReportData } from "@/lib/lead-report";

const STORAGE_PREFIX = "marketboard:lead-report:";

function storageKey(clientId: string, year: number, month: number) {
  return `${STORAGE_PREFIX}${clientId}:${year}-${String(month + 1).padStart(2, "0")}`;
}

function readLocal(clientId: string, year: number, month: number): LeadReportData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(clientId, year, month));
    return raw ? normalizeLeadReport(JSON.parse(raw), 30) : null;
  } catch {
    return null;
  }
}

function writeLocal(clientId: string, year: number, month: number, data: LeadReportData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(clientId, year, month), JSON.stringify(data));
  } catch {
    // Local fallback is best-effort; remote Supabase remains the source of truth.
  }
}

export async function loadLeadReportRemote(
  clientId: string,
  year: number,
  month: number,
): Promise<LeadReportData | null> {
  const { data, error } = await supabase
    .from("lead_reports")
    .select("data")
    .eq("client_id", clientId)
    .eq("year", year)
    .eq("month", month + 1)
    .maybeSingle();
  if (error) {
    console.warn("Lidlar hisobotini Supabase'dan yuklashda xatolik", error);
    return readLocal(clientId, year, month);
  }
  const remote = data?.data ? normalizeLeadReport(data.data, 30) : null;
  if (remote) writeLocal(clientId, year, month, remote);
  return remote;
}

export async function saveLeadReportRemote(
  clientId: string,
  year: number,
  month: number,
  report: LeadReportData,
): Promise<void> {
  writeLocal(clientId, year, month, report);
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Avtorizatsiya yo'q");
  const { error } = await supabase.from("lead_reports").upsert(
    {
      client_id: clientId,
      user_id: userId,
      year,
      month: month + 1,
      data: report,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id,year,month" },
  );
  if (error) {
    console.warn("Lidlar hisobotini Supabase'ga saqlashda xatolik", error);
    throw error;
  }
}

export async function deleteLeadReportRemote(
  clientId: string,
  year: number,
  month: number,
): Promise<void> {
  if (typeof window !== "undefined")
    window.localStorage.removeItem(storageKey(clientId, year, month));
  const { error } = await supabase
    .from("lead_reports")
    .delete()
    .eq("client_id", clientId)
    .eq("year", year)
    .eq("month", month + 1);
  if (error) throw error;
}

export function emptyLeadReport() {
  return createLeadReport(30);
}
