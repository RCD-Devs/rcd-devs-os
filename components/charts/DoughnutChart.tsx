"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useChartTheme } from "@/lib/charts/useChartTheme";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const theme = useChartTheme();
  const total = values.reduce((sum, v) => sum + v, 0);

  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: theme.series,
            borderColor: theme.surface,
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: theme.text,
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 8,
              padding: 14,
              font: { family: "Satoshi", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: theme.surface,
            titleColor: theme.text,
            bodyColor: theme.muted,
            borderColor: theme.grid,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => {
                const value = Number(ctx.raw);
                const pct = total === 0 ? 0 : Math.round((value / total) * 100);
                return ` ${ctx.label}: ${value} (${pct}%)`;
              },
            },
          },
        },
      }}
    />
  );
}
