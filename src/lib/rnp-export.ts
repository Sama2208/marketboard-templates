import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { strToU8, zipSync } from "fflate";
import type { DayRow, MonthData } from "@/lib/rnp";
import { dayCalc, fmt, monthNames, planFunnel, totals } from "@/lib/rnp";

export type RnpExportRow = {
  Kun: number;
  "Budjet $": number;
  "Fact Lead": number;
  "Q.Lead Forma": number;
  "Q.Lead Zvonok": number;
  Yozildi: number;
  Keldi: number;
  Yotdi: number;
  "Lead reja": number;
  "Lead Index %": number;
  "CPL $": number;
  "Q.Lead Total": number;
  "Q.Lead Index %": number;
  "CPQL $": number;
  "Lead→Q.Lead %": number;
};

const dailyHeaders = Object.keys({
  Kun: 0,
  "Budjet $": 0,
  "Fact Lead": 0,
  "Q.Lead Forma": 0,
  "Q.Lead Zvonok": 0,
  Yozildi: 0,
  Keldi: 0,
  Yotdi: 0,
  "Lead reja": 0,
  "Lead Index %": 0,
  "CPL $": 0,
  "Q.Lead Total": 0,
  "Q.Lead Index %": 0,
  "CPQL $": 0,
  "Lead→Q.Lead %": 0,
}) as Array<keyof RnpExportRow>;

const safeFilePart = (value: string) =>
  value
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "marketboard";

const fileBase = (clientName: string, year: number, month: number) =>
  `${safeFilePart(clientName)}-RNP-${year}-${String(month + 1).padStart(2, "0")}`;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  // Matnli qiymatlarda CSV formula injection'ni oldini olamiz.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};

const escapeXml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const excelColumn = (index: number) => {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
};

const excelCell = (value: unknown, row: number, column: number) => {
  const ref = `${excelColumn(column)}${row}`;
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}" t="n"><v>${value}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
};

const excelSheet = (rows: unknown[][]) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => excelCell(value, rowIndex + 1, columnIndex)).join("")}</row>`,
    )
    .join("")}</sheetData></worksheet>`;

const round = (value: number, digits = 2) =>
  Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

export function buildRnpExportRows(data: MonthData): RnpExportRow[] {
  return data.days.map((row: DayRow) => {
    const calc = dayCalc(row, data.plan);
    return {
      Kun: row.day,
      "Budjet $": round(row.budget),
      "Fact Lead": round(row.lead),
      "Q.Lead Forma": round(row.qlForm),
      "Q.Lead Zvonok": round(row.qlCall),
      Yozildi: round(row.zapisan),
      Keldi: round(row.keldi),
      Yotdi: round(row.yotdi),
      "Lead reja": round(calc.leadPlan),
      "Lead Index %": round(calc.leadIndex),
      "CPL $": round(calc.cpl),
      "Q.Lead Total": round(calc.qlTotal),
      "Q.Lead Index %": round(calc.qlIndex),
      "CPQL $": round(calc.cpql),
      "Lead→Q.Lead %": round(calc.leadToQl),
    };
  });
}

function totalExportRow(data: MonthData): RnpExportRow {
  const t = totals(data);
  return {
    Kun: 0,
    "Budjet $": round(t.budget),
    "Fact Lead": round(t.lead),
    "Q.Lead Forma": round(t.qlForm),
    "Q.Lead Zvonok": round(t.qlCall),
    Yozildi: round(t.zapisan),
    Keldi: round(t.keldi),
    Yotdi: round(t.yotdi),
    "Lead reja": round(data.plan.leadGoal),
    "Lead Index %": round(t.leadIndex),
    "CPL $": round(t.cpl),
    "Q.Lead Total": round(t.qlTotal),
    "Q.Lead Index %": round(t.qlIndex),
    "CPQL $": round(t.cpql),
    "Lead→Q.Lead %": round(t.leadToQl),
  };
}

export function downloadRnpCsv(data: MonthData, clientName: string, year: number, month: number) {
  const rows = buildRnpExportRows(data);
  const total = totalExportRow(data);
  const lines = [
    `MarketBoard RNP;${clientName};${monthNames[month]} ${year}`,
    dailyHeaders.map(csvCell).join(";"),
    ...rows.map((row) => dailyHeaders.map((header) => csvCell(row[header])).join(";")),
    ["TOTAL", ...dailyHeaders.slice(1).map((header) => total[header])].map(csvCell).join(";"),
  ];
  downloadBlob(
    new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }),
    `${fileBase(clientName, year, month)}.csv`,
  );
}

export function downloadRnpExcel(data: MonthData, clientName: string, year: number, month: number) {
  const rows = buildRnpExportRows(data);
  const total = totalExportRow(data);
  const plan = planFunnel(data.plan);
  const planRows: unknown[][] = [
    ["Ko'rsatkich", "Qiymat"],
    ["Lead maqsadi", data.plan.leadGoal],
    ["Q.Lead konversiya %", data.plan.qlRate],
    ["Yozildi konversiya %", data.plan.zapRate],
    ["Keldi konversiya %", data.plan.comeRate],
    ["Yotdi konversiya %", data.plan.wonRate],
    ["Oylik budjet $", data.plan.budget],
    ["Ish kunlari", data.plan.workDays],
    ["Lead reja", plan.lead],
    ["Q.Lead reja", plan.qlead],
    ["Yozildi reja", plan.zapisan],
    ["Keldi reja", plan.keldi],
    ["Yotdi reja", plan.yotdi],
  ];
  const dailyRows: unknown[][] = [
    dailyHeaders,
    ...rows.map((row) => dailyHeaders.map((header) => row[header])),
    ["TOTAL", ...dailyHeaders.slice(1).map((header) => total[header])],
  ];
  const files = {
    "[Content_Types].xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/> </Types>`,
    ),
    "_rels/.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ),
    "xl/workbook.xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Oylik reja" sheetId="1" r:id="rId1"/><sheet name="Kunlik ma'lumot" sheetId="2" r:id="rId2"/></sheets></workbook>`,
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>`,
    ),
    "xl/worksheets/sheet1.xml": strToU8(excelSheet(planRows)),
    "xl/worksheets/sheet2.xml": strToU8(excelSheet(dailyRows)),
  };
  downloadBlob(
    new Blob([zipSync(files) as unknown as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileBase(clientName, year, month)}.xlsx`,
  );
}

const pdfText = (value: string) =>
  value.replaceAll("→", "->").replaceAll("’", "'").replaceAll("‘", "'");

export function downloadRnpPdf(data: MonthData, clientName: string, year: number, month: number) {
  const rows = buildRnpExportRows(data);
  const total = totalExportRow(data);
  const t = totals(data);
  const plan = planFunnel(data.plan);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MarketBoard — RNP Funnel Tracker", 32, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(pdfText(`${clientName} | ${monthNames[month]} ${year}`), 32, 51);
  doc.text(
    pdfText(
      `Budjet: $${fmt(t.budget, 2)} | Lead: ${fmt(t.lead)} / ${fmt(plan.lead)} | CPL: $${fmt(t.cpl, 2)} | Sotuv: ${fmt(t.yotdi)}`,
    ),
    32,
    67,
  );

  autoTable(doc, {
    startY: 80,
    head: [["Bosqich", "Reja", "Fakt", "Indeks"]],
    body: [
      ["Lead", fmt(plan.lead), fmt(t.lead), `${fmt(t.leadIndex)}%`],
      ["Q.Lead", fmt(plan.qlead), fmt(t.qlTotal), `${fmt(t.qlIndex)}%`],
      ["Yozildi", fmt(plan.zapisan), fmt(t.zapisan), ""],
      ["Keldi", fmt(plan.keldi), fmt(t.keldi), ""],
      ["Yotdi", fmt(plan.yotdi), fmt(t.yotdi), ""],
    ],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [79, 140, 255], textColor: 255 },
    margin: { left: 32, right: pageWidth - 260 },
  });

  const dailyStartY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 175;
  autoTable(doc, {
    startY: dailyStartY + 14,
    head: [dailyHeaders.map((header) => pdfText(String(header)))],
    body: rows.map((row) => dailyHeaders.map((header) => row[header])),
    foot: [["TOTAL", ...dailyHeaders.slice(1).map((header) => total[header])]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 5.4, cellPadding: 2, halign: "right" },
    headStyles: { fillColor: [79, 140, 255], textColor: 255, halign: "center" },
    footStyles: { fillColor: [224, 234, 255], textColor: [20, 35, 65], fontStyle: "bold" },
    margin: { left: 22, right: 22 },
  });
  doc.save(`${fileBase(clientName, year, month)}.pdf`);
}
