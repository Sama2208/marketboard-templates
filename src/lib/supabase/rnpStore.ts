import { supabase } from "./client";
import type { MonthData } from "@/lib/rnp";

/**
 * RNP ma'lumotini Supabase'da saqlash/yuklash — har mijoz + oy uchun bitta yozuv.
 * Bazada month 1-12, ilovada month 0-11 (JS getMonth). Konvertatsiya shu yerda.
 */

export async function loadMonthRemote(
  clientId: string,
  year: number,
  month: number,
): Promise<MonthData | null> {
  const { data, error } = await supabase
    .from("rnp_months")
    .select("data")
    .eq("client_id", clientId)
    .eq("year", year)
    .eq("month", month + 1)
    .maybeSingle();
  if (error) throw error;
  const payload = (data?.data ?? null) as MonthData | null;
  if (!payload || !payload.plan || !Array.isArray(payload.days)) return null;
  return payload;
}

export async function saveMonthRemote(
  clientId: string,
  year: number,
  month: number,
  monthData: MonthData,
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Avtorizatsiya yo'q");
  const { error } = await supabase.from("rnp_months").upsert(
    {
      client_id: clientId,
      user_id: userId,
      year,
      month: month + 1,
      data: monthData,
    },
    { onConflict: "client_id,year,month" },
  );
  if (error) throw error;
}
