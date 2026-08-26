export type TemplateItem = {
  slug: string;
  title: string;
  description: string;
  tag: string;
  active: boolean;
  to?:
    | "/templates/rnp"
    | "/templates/cpl-cpa"
    | "/templates/weekly-report"
    | "/templates/content-calendar";
};

export const templates: TemplateItem[] = [
  {
    slug: "rnp",
    title: "RNP Funnel Tracker",
    description: "Meta Ads lead funnelini kunlik plan/fakt bo'yicha kuzatish",
    tag: "Analitika",
    active: true,
    to: "/templates/rnp",
  },
  {
    slug: "cpl-cpa",
    title: "CPL / CPA Kalkulyator",
    description: "Lead va sotuv narxini tez hisoblash va solishtirish",
    tag: "Kalkulyator",
    active: true,
    to: "/templates/cpl-cpa",
  },
  {
    slug: "weekly-report",
    title: "Haftalik Hisobot",
    description: "Mijoz uchun haftalik natijalar hisobotini tayyorlash",
    tag: "Hisobot",
    active: true,
    to: "/templates/weekly-report",
  },
  {
    slug: "content-calendar",
    title: "Kontent Kalendar",
    description: "Kontent rejasini oylik kalendar ko'rinishida boshqarish",
    tag: "Kontent",
    active: true,
    to: "/templates/content-calendar",
  },
];
