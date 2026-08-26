export type SalesOperator = {
  id: string;
  operatorName: string;
  lead: number;
  qualified: number;
  visitAgreed: number;
  visited: number;
  sales: number;
  revenue: number;
};

export type SalesData = { operators: SalesOperator[] };

export type SalesOperatorMetrics = SalesOperator & {
  avgCheck: number;
  qualifiedRate: number;
  visitAgreedRate: number;
  visitedRate: number;
  salesRate: number;
  qualifiedToVisit: number;
  qualifiedToSale: number;
};

export type SalesTotals = {
  lead: number;
  qualified: number;
  visitAgreed: number;
  visited: number;
  sales: number;
  revenue: number;
  avgCheck: number;
};

export const emptySalesData: SalesData = { operators: [] };

export function createOperator(index = 1): SalesOperator {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `operator-${Date.now()}-${index}`;
  return {
    id,
    operatorName: `Operator ${index}`,
    lead: 0,
    qualified: 0,
    visitAgreed: 0,
    visited: 0,
    sales: 0,
    revenue: 0,
  };
}

export function normalizeSalesData(value: unknown): SalesData {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray((value as { operators?: unknown }).operators)
  ) {
    return emptySalesData;
  }
  const operators = (value as { operators: unknown[] }).operators
    .filter((operator): operator is Record<string, unknown> =>
      Boolean(operator && typeof operator === "object"),
    )
    .map((operator, index) => ({
      id:
        typeof operator["id"] === "string" && operator["id"]
          ? operator["id"]
          : `operator-${index + 1}`,
      operatorName:
        typeof operator["operatorName"] === "string" && operator["operatorName"].trim()
          ? operator["operatorName"].trim()
          : `Operator ${index + 1}`,
      lead: nonNegativeNumber(operator["lead"]),
      qualified: nonNegativeNumber(operator["qualified"]),
      visitAgreed: nonNegativeNumber(operator["visitAgreed"]),
      visited: nonNegativeNumber(operator["visited"]),
      sales: nonNegativeNumber(operator["sales"]),
      revenue: nonNegativeNumber(operator["revenue"]),
    }));
  return { operators };
}

export function operatorMetrics(operator: SalesOperator): SalesOperatorMetrics {
  return {
    ...operator,
    avgCheck: divide(operator.revenue, operator.sales),
    qualifiedRate: percent(operator.qualified, operator.lead),
    visitAgreedRate: percent(operator.visitAgreed, operator.qualified),
    visitedRate: percent(operator.visited, operator.visitAgreed),
    salesRate: percent(operator.sales, operator.visited),
    qualifiedToVisit: percent(operator.visited, operator.qualified),
    qualifiedToSale: percent(operator.sales, operator.qualified),
  };
}

export function salesTotals(operators: SalesOperator[]): SalesTotals {
  const totals = operators.reduce(
    (result, operator) => ({
      lead: result.lead + operator.lead,
      qualified: result.qualified + operator.qualified,
      visitAgreed: result.visitAgreed + operator.visitAgreed,
      visited: result.visited + operator.visited,
      sales: result.sales + operator.sales,
      revenue: result.revenue + operator.revenue,
    }),
    { lead: 0, qualified: 0, visitAgreed: 0, visited: 0, sales: 0, revenue: 0 },
  );
  return { ...totals, avgCheck: divide(totals.revenue, totals.sales) };
}

function nonNegativeNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function divide(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function percent(numerator: number, denominator: number) {
  return divide(numerator, denominator) * 100;
}
