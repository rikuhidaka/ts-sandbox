import { generateChart } from "../../assets/chart";
import { fileOutput } from "../../assets/file-output";
import { logisticBasedCurve } from "../../assets/math/func/logistic-based-curve";
import { getSamplePoint } from "../../assets/math/sample-point";

export const execute = async () => {
  const generateK = (x: number) => -40 * x + 40;

  Array.from({ length: 10 }, (_, i) => i).map((p) => {
    generateGraph({
      func: (x) => logisticBasedCurve(x, p / 10, generateK(p / 10)),
      fileName: `sample-gradation-${p}.png`,
    });
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
