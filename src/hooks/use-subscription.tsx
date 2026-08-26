import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { loadMySubscription } from "@/lib/supabase/subscriptions";
import { defaultSubscription, isPaidSubscription, type Subscription } from "@/lib/subscription";

type SubscriptionContextValue = {
  subscription: Subscription;
  loading: boolean;
  isPro: boolean;
  refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: defaultSubscription,
  loading: true,
  isPro: false,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscription(defaultSubscription);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setSubscription(await loadMySubscription());
    } catch (error) {
      console.error("Obuna holatini yuklashda xatolik", error);
      setSubscription(defaultSubscription);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const value = useMemo(
    () => ({ subscription, loading, isPro: isPaidSubscription(subscription), refresh }),
    [subscription, loading, refresh],
  );
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

// Context hook intentionally lives next to its provider so subscription state stays private to this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useSubscription() {
  return useContext(SubscriptionContext);
}
