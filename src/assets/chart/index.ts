import { ChartConfiguration } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export const generateChart = async ({
  data,
  labels,
  width = 800,
  height = 600,
}: {
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
}) => {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration: ChartConfiguration<"line", number[], string> = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Sample Data",
          data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "X-axis",
          },
        },
        y: {
          title: {
            display: true,
            text: "Y-axis",
          },
        },
      },
    },
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
};
