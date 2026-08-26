/**
 * Samandar "Pre Sale" sahifasining platformadagi domen modeli.
 *
 * Manba jadvalda kunlik kataklar qo'lda to'ldiriladi. Oylik jami va ulush
 * qiymatlari esa platformada shu kataklardan real-time hisoblanadi.
 */

export const LEAD_REPORT_TITLE = "Lidlar bo'yicha to'liq hisobot";

export type LeadReportRow = {
  id: string;
  label: string;
  values: number[];
};

export type LeadReportOperator = {
  id: string;
  name: string;
  sourceNote?: string;
  rows: LeadReportRow[];
};

export type LeadReportData = {
  version: 1;
  days: number;
  operators: LeadReportOperator[];
};

export type LeadReportStage = "leads" | "quality" | "booked" | "attended" | "won";

export type LeadReportTotals = Record<LeadReportStage, number> & {
  nonQuality: number;
  qualityRate: number;
  bookedRate: number;
  attendedRate: number;
  wonRate: number;
};

export type LeadReportOperatorTotals = LeadReportTotals & {
  name: string;
};

const BASE_REASONS = [
  "Lidlar soni",
  "O'chiq",
  "Ko'tarmadi",
  "Bizni kasal emas",
  "Xato raqam",
  "Adashgan",
  "Xizmat doira",
  "Sharoiti yo'q",
  "Sifatli lidlar",
  "Konsultatsiya",
  "Ma'lumot oldi",
  "Viloyat kons",
  "Keyingi oylarda",
] as const;

const NON_QUALITY_LABELS = new Set([
  "o'chiq",
  "ko'tarmadi",
  "bizni kasal emas",
  "xato raqam",
  "adashgan",
  "xizmat doira",
  "sharoiti yo'q",
]);

const STAGE_ALIASES: Record<LeadReportStage, string[]> = {
  leads: ["lidlar soni"],
  quality: ["sifatli lidlar"],
  booked: ["qabulga keldi"],
  attended: ["qatnadi"],
  won: ["yotdi"],
};

const normalizeLabel = (label: string) =>
  label.toLocaleLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ").trim();

const stageForLabel = (label: string): LeadReportStage | null => {
  const normalized = normalizeLabel(label);
  for (const [stage, aliases] of Object.entries(STAGE_ALIASES) as [LeadReportStage, string[]][]) {
    if (aliases.includes(normalized)) return stage;
  }
  return null;
};

const rowId = (operatorId: string, index: number) => `${operatorId}-row-${index + 1}`;

const operatorDefinitions: Array<{
  id: string;
  name: string;
  sourceNote?: string;
  statuses: string[];
}> = [
  {
    id: "munisa-turobova",
    name: "Munisa Turobova",
    statuses: [...BASE_REASONS, "Kiruvchi qo'ng'iroq", "Qabulga keldi", "Qatnadi", "Yotdi"],
  },
  {
    id: "ruxshona",
    name: "Ruxshona",
    statuses: [...BASE_REASONS, "KKQ", "Instagram", "Qabulga keldi", "Qatnadi", "Yotdi"],
  },
  {
    id: "ruxshona-2",
    name: "Ruxshona — 2-blok",
    sourceNote: "Manba varaqda operator nomi bo'sh qolgan ikkinchi blok.",
    statuses: [...BASE_REASONS, "KQ", "qayta aloqa", "Qabulga keldi", "Qatnadi", "Yotdi"],
  },
  {
    id: "gavhar",
    name: "Gavhar",
    sourceNote: "Manba varaqda bu operator nomi faqat Yotdi qatorida ko'ringan.",
    statuses: ["Yotdi"],
  },
  {
    id: "muqaddas",
    name: "Muqaddas",
    statuses: [
      ...BASE_REASONS,
      "KQ",
      "Umurtqa sentiri",
      "Qayta aloqalar",
      "Qabulga keldi",
      "Qatnadi",
      "Yotdi",
    ],
  },
  {
    id: "munisa-yusufova",
    name: "Munisa Yusufova",
    statuses: [...BASE_REASONS, "kq", "Qabulga keldi", "Qatnadi", "Yotdi"],
  },
  {
    id: "iroda",
    name: "Iroda",
    statuses: [...BASE_REASONS, "Qabulga keldi", "Qatnadi", "Yotdi"],
  },
];

export function createLeadReport(days = 31): LeadReportData {
  const safeDays = Math.max(1, Math.min(31, Math.trunc(days)));
  return {
    version: 1,
    days: safeDays,
    operators: operatorDefinitions.map((definition) =>
      createOperatorFromDefinition(definition, safeDays),
    ),
  };
}

function createOperatorFromDefinition(
  definition: (typeof operatorDefinitions)[number],
  days: number,
): LeadReportOperator {
  const operator: LeadReportOperator = {
    id: definition.id,
    name: definition.name,
    rows: definition.statuses.map((label, index) => ({
      id: rowId(definition.id, index),
      label,
      values: Array.from({ length: days }, () => 0),
    })),
  };
  if (definition.sourceNote) operator.sourceNote = definition.sourceNote;
  return operator;
}

export function createCustomLeadReportOperator(name: string, days = 30): LeadReportOperator {
  const id = `operator-${Date.now().toString(36)}`;
  return createOperatorFromDefinition(
    {
      id,
      name: name.trim() || "Yangi operator",
      statuses: [...BASE_REASONS, "Qabulga keldi", "Qatnadi", "Yotdi"],
    },
    Math.max(1, Math.min(31, Math.trunc(days))),
  );
}

function finiteNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : 0;
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

/** Saqlangan JSON eskirgan bo'lsa, yangi operator/qatorlarni ham qo'shib normalize qiladi. */
export function normalizeLeadReport(value: unknown, days: number): LeadReportData {
  const fallback = createLeadReport(days);
  if (!value || typeof value !== "object") return fallback;
  const input = value as Partial<LeadReportData>;
  const sourceOperators = Array.isArray(input.operators) ? input.operators : [];
  const operators = fallback.operators.map((fallbackOperator) => {
    const source = sourceOperators.find((item) => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<LeadReportOperator>;
      return candidate.id === fallbackOperator.id;
    }) as Partial<LeadReportOperator> | undefined;
    const sourceRows = Array.isArray(source?.rows) ? source.rows : [];
    return {
      ...fallbackOperator,
      name:
        typeof source?.name === "string" && source.name.trim()
          ? source.name.trim()
          : fallbackOperator.name,
      rows: fallbackOperator.rows.map((fallbackRow) => {
        const sourceRow = sourceRows.find((item) => {
          if (!item || typeof item !== "object") return false;
          return (item as Partial<LeadReportRow>).id === fallbackRow.id;
        }) as Partial<LeadReportRow> | undefined;
        const values = Array.isArray(sourceRow?.values) ? sourceRow.values : [];
        return {
          ...fallbackRow,
          values: Array.from({ length: days }, (_, day) => finiteNumber(values[day])),
        };
      }),
    };
  });
  const knownIds = new Set(fallback.operators.map((operator) => operator.id));
  const extraOperators = sourceOperators.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Partial<LeadReportOperator>;
    if (!source.id || knownIds.has(source.id) || !Array.isArray(source.rows)) return [];
    const extraId = source.id;
    const extra: LeadReportOperator = {
      id: extraId,
      name:
        typeof source.name === "string" && source.name.trim()
          ? source.name.trim()
          : "Yangi operator",
      rows: source.rows.flatMap((row, index) => {
        if (!row || typeof row !== "object") return [];
        const sourceRow = row as Partial<LeadReportRow>;
        const values = Array.isArray(sourceRow.values) ? sourceRow.values : [];
        return [
          {
            id:
              typeof sourceRow.id === "string" && sourceRow.id
                ? sourceRow.id
                : rowId(extraId, index),
            label:
              typeof sourceRow.label === "string" && sourceRow.label.trim()
                ? sourceRow.label
                : "Status",
            values: Array.from({ length: days }, (_, day) => finiteNumber(values[day])),
          },
        ];
      }),
    };
    if (typeof source.sourceNote === "string" && source.sourceNote)
      extra.sourceNote = source.sourceNote;
    return [extra];
  });
  return { version: 1, days, operators: [...operators, ...extraOperators] };
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + finiteNumber(value), 0);
}

function divide(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function emptyTotals(): LeadReportTotals {
  return {
    leads: 0,
    quality: 0,
    booked: 0,
    attended: 0,
    won: 0,
    nonQuality: 0,
    qualityRate: 0,
    bookedRate: 0,
    attendedRate: 0,
    wonRate: 0,
  };
}

function addRowTotals(target: LeadReportTotals, rows: LeadReportRow[]) {
  for (const row of rows) {
    const total = sum(row.values);
    const stage = stageForLabel(row.label);
    if (stage) target[stage] += total;
    if (NON_QUALITY_LABELS.has(normalizeLabel(row.label))) target.nonQuality += total;
  }
}

function finishTotals(totals: LeadReportTotals): LeadReportTotals {
  return {
    ...totals,
    qualityRate: divide(totals.quality, totals.leads) * 100,
    bookedRate: divide(totals.booked, totals.quality || totals.leads) * 100,
    attendedRate: divide(totals.attended, totals.booked) * 100,
    wonRate: divide(totals.won, totals.attended || totals.booked) * 100,
  };
}

export function leadReportTotals(data: LeadReportData): LeadReportTotals {
  const totals = emptyTotals();
  for (const operator of data.operators) addRowTotals(totals, operator.rows);
  return finishTotals(totals);
}

export function calculateOperatorTotals(operator: LeadReportOperator): LeadReportOperatorTotals {
  const totals = emptyTotals();
  addRowTotals(totals, operator.rows);
  return { name: operator.name, ...finishTotals(totals) };
}

export function rowTotal(row: LeadReportRow) {
  return sum(row.values);
}

export function rowShare(row: LeadReportRow, leads: number) {
  return divide(rowTotal(row), leads) * 100;
}

export function dailyStageTotals(data: LeadReportData) {
  return Array.from({ length: data.days }, (_, day) => {
    const totals = emptyTotals();
    for (const operator of data.operators) {
      for (const row of operator.rows) {
        const value = finiteNumber(row.values[day]);
        const stage = stageForLabel(row.label);
        if (stage) totals[stage] += value;
        if (NON_QUALITY_LABELS.has(normalizeLabel(row.label))) totals.nonQuality += value;
      }
    }
    return finishTotals(totals);
  });
}

export function statusGroup(label: string) {
  const normalized = normalizeLabel(label);
  if (normalized === "lidlar soni") return "Kirish";
  if (
    normalized === "sifatli lidlar" ||
    normalized === "konsultatsiya" ||
    normalized === "ma'lumot oldi"
  ) {
    return "Sifat / aloqa";
  }
  if (["qabulga keldi", "qatnadi", "yotdi"].includes(normalized)) return "Natija";
  if (NON_QUALITY_LABELS.has(normalized)) return "Sabab / chiqish";
  return "Qo'shimcha belgi";
}
