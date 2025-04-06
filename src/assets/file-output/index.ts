import * as fs from "fs";

export const fileOutput = ({
  fileName,
  output,
}: {
  fileName: string;
  output: string | NodeJS.ArrayBufferView;
}) => {
  const filePath = `output/${fileName}`;
  // 5) 出力ファイルに保存
  fs.writeFileSync(filePath, output);
  console.log(`${filePath} を出力しました`);
};
