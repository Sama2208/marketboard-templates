import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthData } from "@/lib/rnp";
import { planFunnel, totals } from "@/lib/rnp";

const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function RnpCharts({ data }: { data: MonthData }) {
  const pf = planFunnel(data.plan);
  const t = totals(data);

  const funnelData = [
    { stage: "Lead", Reja: Math.round(pf.lead), Fakt: t.lead },
    { stage: "Q.Lead", Reja: Math.round(pf.qlead), Fakt: t.qlTotal },
    { stage: "Yozildi", Reja: Math.round(pf.zapisan), Fakt: t.zapisan },
    { stage: "Keldi", Reja: Math.round(pf.keldi), Fakt: t.keldi },
    { stage: "Yotdi", Reja: Math.round(pf.yotdi), Fakt: t.yotdi },
  ];

  const dailyPlan = data.plan.workDays > 0 ? pf.lead / data.plan.workDays : 0;
  const dailyData = data.days.map((d) => ({
    day: d.day,
    Lead: d.lead,
    Reja: Number(dailyPlan.toFixed(1)),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card-surface p-5">
        <h3 className="font-display text-sm font-semibold">Funnel: Reja vs Fakt</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="stage" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Reja" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Fakt" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-display text-sm font-semibold">Kunlik leadlar</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Lead" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="Reja"
                stroke="var(--chart-3)"
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
