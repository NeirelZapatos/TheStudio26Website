import React from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import "./chartjs-setup";

interface ChartProps {
    category: string;
    data: { name: string; sales: number }[];
}

const CategorySalesChart: React.FC<ChartProps> = ({ category, data }) => {
    const chartData = {
        labels: data.map((item) => item.name),
        datasets: [
            {
                label: `${category} Sales`,
                data: data.map((item) => item.sales),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }
        ]
    };

    const chartOptions: any = {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Top 3 ${category} Items by Sales`,
          },
          legend: {
            display: false,
          },
        },
      
        scales: {
          y: {
            type: "linear",
            title: {
              display: true,
              text: "Sales Count",
              font: {
                size: 14,
                weight: "bold",
              },
              padding: {
                top: 10,
              },
            },
            ticks: {
              beginAtZero: true,
            },
          },
          x: {
            ticks: {
              autoSkip: false,
            },
          },
        },
      };
      

    return (
        <div className = "bg-white p-4 rounded-lg shadow-md">
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};

export default CategorySalesChart;
