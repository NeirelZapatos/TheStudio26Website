import React from "react";
import { Line } from "react-chartjs-2";
import {
    ChartOptions,
    ChartTypeRegistry,
    TickOptions,
    Scriptable,
    ScaleOptions,
  } from "chart.js";  
import "./chartjs-setup";
interface CategorySalesChartProps {
  category: string;
  salesData: Record<string, number>; // e.g., { "2025-01": 5000, "2025-02": 8000 }
}

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ category, salesData }) => {
  const months = Object.keys(salesData).sort();
  const values = months.map((month) => salesData[month]);

  // Determine trend color
  const isUpwardTrend = values.length > 1 && values[values.length - 1] >= values[0];
  const lineColor = isUpwardTrend ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)"; // green or red

  const chartData = {
    labels: months,
    datasets: [
      {
        label: `${category} Revenue`,
        data: values,
        fill: false,
        backgroundColor: lineColor,
        borderColor: lineColor,
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
          text: "Month",
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
