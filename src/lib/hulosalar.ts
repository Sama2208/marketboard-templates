import type { SalesData } from "@/lib/sales";
import { salesTotals } from "@/lib/sales";
import { planFunnel, totals, type MonthData, type PlanSettings } from "@/lib/rnp";

export type HulosalarRow = {
  key: "lead" | "qualified" | "sales" | "qualifiedToSales" | "leadToSales";
  label: string;
  plan: number;
  fact: number;
  index: number;
  kind: "count" | "percent";
};

export type HulosalarCost = {
  plan: number;
  fact: number;
};

export type HulosalarResult = {
  rows: HulosalarRow[];
  marketing: {
    budget: HulosalarCost;
    cpl: HulosalarCost;
    cpql: HulosalarCost;
    cpa: HulosalarCost;
  };
  sales: ReturnType<typeof salesTotals>;
};

export function computeHulosalar(
  monthData: MonthData,
  salesData: SalesData,
  plan: PlanSettings = monthData.plan,
): HulosalarResult {
  const fact = totals(monthData);
  const planFunnelValues = planFunnel(plan);
  const sales = salesTotals(salesData.operators);

  const rows: HulosalarRow[] = [
    row("lead", "Lead", planFunnelValues.lead, fact.lead, "count"),
    row("qualified", "Q.Leadlar", planFunnelValues.qlead, fact.qlTotal, "count"),
    row("sales", "Yotdi / Sotuv", planFunnelValues.yotdi, fact.yotdi, "count"),
    row(
      "qualifiedToSales",
      "Q.Lead → Yotdi",
      percent(planFunnelValues.yotdi, planFunnelValues.qlead),
      percent(fact.yotdi, fact.qlTotal),
      "percent",
    ),
    row(
      "leadToSales",
      "Lead → Yotdi",
      percent(planFunnelValues.yotdi, planFunnelValues.lead),
      percent(fact.yotdi, fact.lead),
      "percent",
    ),
  ];

  return {
    rows,
    marketing: {
      budget: { plan: nonNegative(plan.budget), fact: nonNegative(fact.budget) },
      cpl: { plan: divide(plan.budget, planFunnelValues.lead), fact: fact.cpl },
      cpql: { plan: divide(plan.budget, planFunnelValues.qlead), fact: fact.cpql },
      cpa: { plan: divide(plan.budget, planFunnelValues.yotdi), fact: fact.cpa },
    },
    sales,
  };
}

function row(
  key: HulosalarRow["key"],
  label: string,
  plan: number,
  fact: number,
  kind: HulosalarRow["kind"],
): HulosalarRow {
  return { key, label, plan, fact, index: percent(fact, plan), kind };
}

function percent(numerator: number, denominator: number) {
  return divide(numerator, denominator) * 100;
}

function divide(numerator: number, denominator: number) {
  return denominator > 0 && Number.isFinite(numerator) ? numerator / denominator : 0;
}

function nonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
