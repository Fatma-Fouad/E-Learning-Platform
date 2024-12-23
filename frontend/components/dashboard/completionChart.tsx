import React from "react";
import { Pie } from "react-chartjs-2";

interface CompletionChartProps {
  completionPercentage: number;
}

const CompletionChart: React.FC<CompletionChartProps> = ({
  completionPercentage,
}) => {
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [completionPercentage, 100 - completionPercentage],
        backgroundColor: ["#4CAF50", "#FF5722"],
      },
    ],
  };

  return (
    <div>
      <h4>Completion Percentage</h4>
      <Pie data={data} />
    </div>
  );
};

export default CompletionChart;
