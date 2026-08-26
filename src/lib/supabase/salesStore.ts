import type { SalesData } from "@/lib/sales";
import { normalizeSalesData } from "@/lib/sales";
import { supabase } from "./client";

export async function loadSalesRemote(
  clientId: string,
  year: number,
  month: number,
): Promise<SalesData> {
  const { data, error } = await supabase
    .from("rnp_sales")
    .select("operators")
    .eq("client_id", clientId)
    .eq("year", year)
    .eq("month", month + 1)
    .maybeSingle();
  if (error) throw error;
  return normalizeSalesData({ operators: data?.operators });
}

export async function saveSalesRemote(
  clientId: string,
  year: number,
  month: number,
  salesData: SalesData,
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Avtorizatsiya yo'q");

  const { error } = await supabase.from("rnp_sales").upsert(
    {
      client_id: clientId,
      user_id: userId,
      year,
      month: month + 1,
      operators: normalizeSalesData(salesData).operators,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id,year,month" },
  );
  if (error) throw error;
}

export async function deleteSalesRemote(
  clientId: string,
  year: number,
  month: number,
): Promise<void> {
  const { error } = await supabase
    .from("rnp_sales")
    .delete()
    .eq("client_id", clientId)
    .eq("year", year)
    .eq("month", month + 1);
  if (error) throw error;
}
