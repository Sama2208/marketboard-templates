export type PlanId = "free" | "pro";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export type Subscription = {
  plan: PlanId;
  status: SubscriptionStatus;
  provider: "payme" | "click" | "stripe" | null;
  currentPeriodEnd: string | null;
};

export const defaultSubscription: Subscription = {
  plan: "free",
  status: "active",
  provider: null,
  currentPeriodEnd: null,
};

export const planCatalog: Array<{
  id: PlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}> = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "RNP bilan boshlash uchun",
    features: ["RNP Funnel Tracker", "1 ta mijoz", "CSV eksport"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9 / oy",
    description: "Agentlik va faol marketologlar uchun",
    features: ["Cheksiz mijozlar", "Excel va PDF eksport", "Barcha shablonlar"],
    featured: true,
  },
];

export function isPaidSubscription(subscription: Subscription) {
  return subscription.plan === "pro" && ["active", "trialing"].includes(subscription.status);
}
