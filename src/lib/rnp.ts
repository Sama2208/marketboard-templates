/**
 * RNP Funnel Tracker — domain logic (plan funnel, daily calculations, storage).
 * Kept framework-free so it can later be persisted server-side.
 */

export type PlanSettings = {
  leadGoal: number;
  qlRate: number; // %
  zapRate: number; // %
  comeRate: number; // %
  wonRate: number; // %
  budget: number; // $
  workDays: number;
};

export const defaultPlan: PlanSettings = {
  leadGoal: 800,
  qlRate: 60,
  zapRate: 63,
  comeRate: 50,
  wonRate: 50,
  budget: 1200,
  workDays: 27,
};

export type DayRow = {
  day: number;
  budget: number;
  lead: number;
  qlForm: number;
  qlCall: number;
  zapisan: number;
  keldi: number;
  yotdi: number;
};

export type MonthData = {
  plan: PlanSettings;
  days: DayRow[];
};

export const emptyRow = (day: number): DayRow => ({
  day,
  budget: 0,
  lead: 0,
  qlForm: 0,
  qlCall: 0,
  zapisan: 0,
  keldi: 0,
  yotdi: 0,
});

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function createMonthData(year: number, month: number, plan = defaultPlan): MonthData {
  return {
    plan,
    days: Array.from({ length: daysInMonth(year, month) }, (_, i) => emptyRow(i + 1)),
  };
}

export type PlanFunnel = {
  lead: number;
  qlead: number;
  zapisan: number;
  keldi: number;
  yotdi: number;
};

export function planFunnel(p: PlanSettings): PlanFunnel {
  const lead = p.leadGoal;
  const qlead = (lead * p.qlRate) / 100;
  const zapisan = (qlead * p.zapRate) / 100;
  const keldi = (zapisan * p.comeRate) / 100;
  const yotdi = (keldi * p.wonRate) / 100;
  return { lead, qlead, zapisan, keldi, yotdi };
}

const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export type DayCalc = {
  leadPlan: number;
  leadIndex: number;
  cpl: number;
  qlTotal: number;
  qlPlan: number;
  qlIndex: number;
  cpql: number;
  leadToQl: number;
};

export function dayCalc(row: DayRow, plan: PlanSettings): DayCalc {
  const pf = planFunnel(plan);
  const leadPlan = div(pf.lead, plan.workDays);
  const qlPlan = div(pf.qlead, plan.workDays);
  const qlTotal = row.qlForm + row.qlCall;
  return {
    leadPlan,
    qlPlan,
    qlTotal,
    leadIndex: div(row.lead, leadPlan) * 100,
    cpl: div(row.budget, row.lead),
    qlIndex: div(qlTotal, qlPlan) * 100,
    cpql: div(row.budget, qlTotal),
    leadToQl: div(qlTotal, row.lead) * 100,
  };
}

export type Totals = {
  budget: number;
  lead: number;
  qlForm: number;
  qlCall: number;
  qlTotal: number;
  zapisan: number;
  keldi: number;
  yotdi: number;
  cpl: number;
  cpql: number;
  cpa: number;
  leadIndex: number;
  qlIndex: number;
  leadToQl: number;
  leadToSale: number;
  qlToSale: number;
};

export function totals(data: MonthData): Totals {
  const t = data.days.reduce(
    (acc, r) => ({
      budget: acc.budget + r.budget,
      lead: acc.lead + r.lead,
      qlForm: acc.qlForm + r.qlForm,
      qlCall: acc.qlCall + r.qlCall,
      zapisan: acc.zapisan + r.zapisan,
      keldi: acc.keldi + r.keldi,
      yotdi: acc.yotdi + r.yotdi,
    }),
    { budget: 0, lead: 0, qlForm: 0, qlCall: 0, zapisan: 0, keldi: 0, yotdi: 0 },
  );
  const pf = planFunnel(data.plan);
  const qlTotal = t.qlForm + t.qlCall;
  return {
    ...t,
    qlTotal,
    cpl: div(t.budget, t.lead),
    cpql: div(t.budget, qlTotal),
    cpa: div(t.budget, t.yotdi),
    leadIndex: div(t.lead, pf.lead) * 100,
    qlIndex: div(qlTotal, pf.qlead) * 100,
    leadToQl: div(qlTotal, t.lead) * 100,
    leadToSale: div(t.yotdi, t.lead) * 100,
    qlToSale: div(t.yotdi, qlTotal) * 100,
  };
}

/* ---------- storage ---------- */

const key = (year: number, month: number) =>
  `marketboard:rnp:${year}-${String(month + 1).padStart(2, "0")}`;

export function loadMonth(year: number, month: number): MonthData {
  if (typeof window === "undefined") return createMonthData(year, month);
  try {
    const raw = window.localStorage.getItem(key(year, month));
    if (!raw) return createMonthData(year, month);
    const parsed = JSON.parse(raw) as MonthData;
    const base = createMonthData(year, month, { ...defaultPlan, ...parsed.plan });
    const byDay = new Map((parsed.days ?? []).map((d) => [d.day, d]));
    base.days = base.days.map((d) => ({ ...d, ...(byDay.get(d.day) ?? {}) }));
    return base;
  } catch {
    return createMonthData(year, month);
  }
}

export function saveMonth(year: number, month: number, data: MonthData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(year, month), JSON.stringify(data));
}

export const monthNames = [
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

export const fmt = (n: number, digits = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "0";

export function indexTone(pct: number): "good" | "warn" | "bad" {
  if (pct >= 95) return "good";
  if (pct >= 70) return "warn";
  return "bad";
}
