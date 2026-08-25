import { supabase } from "@/lib/supabase/client";
import type { MonthData } from "@/lib/rnp";

type RnpMonthRow = {
  data: unknown;
};

export async function loadRnpMonth(userId: string, year: number, month: number) {
  const { data, error } = await supabase
    .from("rnp_months")
    .select("data")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", month + 1)
    .maybeSingle<RnpMonthRow>();

  if (error) throw error;
  return data?.data as MonthData | null | undefined;
}

export async function saveRnpMonth(userId: string, year: number, month: number, data: MonthData) {
  const { error } = await supabase.from("rnp_months").upsert(
    {
      user_id: userId,
      year,
      month: month + 1,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,year,month" },
  );

  if (error) throw error;
}
