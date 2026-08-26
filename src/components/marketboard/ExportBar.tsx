import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import type { MonthData } from "@/lib/rnp";
import { downloadRnpCsv, downloadRnpExcel, downloadRnpPdf } from "@/lib/rnp-export";

export function ExportBar({
  data,
  clientName,
  year,
  month,
  disabled,
  isPro = false,
}: {
  data: MonthData;
  clientName: string;
  year: number;
  month: number;
  disabled?: boolean;
  isPro?: boolean;
}) {
  const run = (format: "xlsx" | "csv" | "pdf") => {
    try {
      if (format === "xlsx") downloadRnpExcel(data, clientName, year, month);
      if (format === "csv") downloadRnpCsv(data, clientName, year, month);
      if (format === "pdf") downloadRnpPdf(data, clientName, year, month);
    } catch (error) {
      console.error("Eksportda xatolik", error);
      window.alert("Eksport yaratilmadi. Qayta urinib ko'ring.");
    }
  };

  return (
    <section className="card-surface flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <FileDown className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium">Hisobotni eksport qilish</p>
          <p className="text-xs text-muted-foreground">Tanlangan mijoz va oy ma'lumotlari</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || !isPro}
          title={!isPro ? "Excel eksport — Pro rejada" : undefined}
          onClick={() => run("xlsx")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-success/50 px-3 py-2 text-xs font-medium text-success transition-colors hover:bg-success/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> Excel{!isPro ? " · Pro" : ""}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => run("csv")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText className="h-3.5 w-3.5" /> CSV
        </button>
        <button
          type="button"
          disabled={disabled || !isPro}
          title={!isPro ? "PDF eksport — Pro rejada" : undefined}
          onClick={() => run("pdf")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileDown className="h-3.5 w-3.5" /> PDF{!isPro ? " · Pro" : ""}
        </button>
      </div>
    </section>
  );
}
