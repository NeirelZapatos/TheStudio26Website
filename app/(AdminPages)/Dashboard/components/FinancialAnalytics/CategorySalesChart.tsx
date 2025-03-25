import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import "./chartjs-setup";

interface CategorySalesChartProps {
  category: string;
  salesData: Record<string, number>;
  timeFrame: string;
}

// Generate fallback labels if there's not enough data
const generatePlaceholderLabels = (timeFrame: string): string[] => {
  const today = new Date();
  const labels: string[] = [];

  if (timeFrame === "Daily") {
    for (let i = 2; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toISOString().split("T")[0]);
    }
  } else if (timeFrame === "Monthly") {
    for (let i = 2; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    }
  } else if (timeFrame === "Quarterly") {
    for (let i = 2; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i * 3, 1);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      labels.push(`${year}-Q${quarter}`);
    }
  } else if (timeFrame === "Yearly") {
    for (let i = 2; i >= 0; i--) {
      labels.push(String(today.getFullYear() - i));
    }
  }

  return labels;
};

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ category, salesData, timeFrame }) => {
  const dataLabels = Object.keys(salesData).sort();
  const dataValues = dataLabels.map(label => salesData[label]);

  const labelsToUse = dataLabels.length >= 3 ? dataLabels : generatePlaceholderLabels(timeFrame);
  const valuesToUse = dataLabels.length >= 3
    ? dataValues
    : labelsToUse.map(label => salesData[label] ?? 0);

  const isUpwardTrend = valuesToUse.length > 1 && valuesToUse.at(-1)! >= valuesToUse[0];
  const trendColor = isUpwardTrend ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";

  const chartData = {
    labels: labelsToUse,
    datasets: [
      {
        label: `${category} Revenue`,
        data: valuesToUse,
        fill: false,
        backgroundColor: trendColor,
        borderColor: trendColor,
        tension: 0.3,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${category} Revenue Trend`,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        type: "linear",
        min: 0,
        title: {
          display: true,
          text: "Revenue ($)",
        },
        ticks: {
          callback: function (value) {
            return `$${value}`;
          },
        },
      },
      x: {
        title: {
          display: true,
          text:
            timeFrame === "Monthly"
              ? "Month"
              : timeFrame === "Quarterly"
              ? "Quarter"
              : timeFrame === "Yearly"
              ? "Year"
              : "Date",
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default CategorySalesChart;
