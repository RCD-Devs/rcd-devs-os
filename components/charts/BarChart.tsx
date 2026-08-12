"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useChartTheme } from "@/lib/charts/useChartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const theme = useChartTheme();

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: theme.series[0],
            hoverBackgroundColor: theme.series[1],
            borderRadius: 4,
            maxBarThickness: 28,
          },
        ],
      }}
      options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            backgroundColor: theme.surface,
            titleColor: theme.text,
            bodyColor: theme.muted,
            borderColor: theme.grid,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: theme.muted, font: { family: "Satoshi", size: 11 }, precision: 0 },
            grid: { color: theme.grid },
            border: { display: false },
          },
          y: {
            ticks: { color: theme.text, font: { family: "Satoshi", size: 12 } },
            grid: { display: false },
            border: { display: false },
          },
        },
      }}
    />
  );
}
