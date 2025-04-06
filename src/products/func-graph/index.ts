import { generateChart } from "../../assets/chart";
import { fileOutput } from "../../assets/file-output";
import { logisticBasedCurve } from "../../assets/math/func/logistic-based-curve";
import { getSamplePoint } from "../../assets/math/sample-point";

export const execute = async () => {
  generateGraph({
    func: (x) => logisticBasedCurve(x, 0.5, 10.0),
    fileName: "logistic-based-curve-1.png",
  });

  generateGraph({
    func: (x) => logisticBasedCurve(x, 0.5, 20.0),
    fileName: "logistic-based-curve-2.png",
  });

  generateGraph({
    func: (x) => logisticBasedCurve(x, 0.5, 30.0),
    fileName: "logistic-based-curve-3.png",
  });
};

const generateGraph = async ({
  func,
  fileName,
}: {
  func: (x: number) => number;
  fileName: string;
}) => {
  const samplePoints = getSamplePoint({
    func: (x) => func(x),
  });

  const imageBuffer = await generateChart({
    data: samplePoints,
    labels: samplePoints.map((d) => d.toFixed(2)),
  });

  fileOutput({
    fileName,
    output: imageBuffer,
  });
};
