import { supabase } from "@/lib/supabase/client";
import { defaultSubscription, type Subscription } from "@/lib/subscription";

type SubscriptionRow = {
  plan: Subscription["plan"];
  status: Subscription["status"];
  provider: Subscription["provider"];
  current_period_end: string | null;
};

export async function loadMySubscription(): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan,status,provider,current_period_end")
    .maybeSingle<SubscriptionRow>();
  if (error) throw error;
  if (!data) return defaultSubscription;
  return {
    plan: data.plan,
    status: data.status,
    provider: data.provider,
    currentPeriodEnd: data.current_period_end,
  };
}
