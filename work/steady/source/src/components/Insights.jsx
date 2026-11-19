import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { ChartNoAxesColumnIncreasing, Trophy, ReceiptText } from "lucide-react";
import { TRIGGERS, money, totals } from "../lib/finance";
import { PageHeading, PanelTitle } from "./UI";

export default function Insights({ data, now }) {
  const { currency } = data.settings;
  const groups = TRIGGERS.map((name) => ({
    name,
    value:
      data.expenses
        .filter((e) => e.trigger === name)
        .reduce((s, e) => s + e.value, 0) / 100,
  }));
  const { saved, unplanned } = totals(data, now);
  return (
    <>
      <PageHeading
        title="Behavioural insights"
        subtitle="See the patterns behind your discretionary spending."
      />
      <div className="two-col">
        <section className="card savings">
          <PanelTitle icon={Trophy}>Total impulse money saved</PanelTitle>
          <div className="big-number">{money(saved, currency)}</div>
          <p>Value of skipped vault purchases, all time.</p>
        </section>
        <section className="card">
          <PanelTitle icon={ReceiptText}>Total unplanned spend</PanelTitle>
          <div className="big-number amber">{money(unplanned, currency)}</div>
          <p>Logged expenses tagged with a trigger other than Planned.</p>
        </section>
      </div>
      <section className="card recent">
        <PanelTitle
          icon={ChartNoAxesColumnIncreasing}
          aside={<span className="chip">All time</span>}
        >
          Spending by trigger
        </PanelTitle>
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={groups}
              margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
              accessibilityLayer
            >
              <CartesianGrid
                horizontal={false}
                stroke="#e3eae6"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => currency + v}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={99}
                tick={{ fontSize: 12, fill: "#42544c" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [
                  money(Math.round(Number(v) * 100), currency),
                  "Spent",
                ]}
                cursor={{ fill: "#eef5f0" }}
              />
              <Bar
                dataKey="value"
                barSize={22}
                radius={[0, 6, 6, 0]}
                isAnimationActive={false}
              >
                {groups.map((g) => (
                  <Cell
                    key={g.name}
                    fill={g.name === "Planned" ? "#16815a" : "#819e90"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details>
          <summary>View chart data</summary>
          <dl>
            {groups.map((g) => (
              <div className="between data-line" key={g.name}>
                <dt>{g.name}</dt>
                <dd>{money(Math.round(g.value * 100), currency)}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>
    </>
  );
}
