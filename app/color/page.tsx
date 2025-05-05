'use client';

import { Box, Slider, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { labToSRGB, sRGBtoLab } from '../../src/assets/color';
import { Lab, RGB } from '../../src/assets/color/function';
import { logisticBasedCurve } from '../../src/assets/math/func/logistic-based-curve';

/**
 * 認証ページのレイアウト
 * @param props - コンポーネントのprops
 */
const Page = () => {
  const color1: RGB = [178, 195, 223];
  const color2: RGB = [14, 75, 176];

  const [value, setValue] = useState<number>(10);
  const [sessionStartValue, setSessionStartValue] = useState<number>(10);

  const color3 = useMemo(() => {
    const color1Lab = sRGBtoLab(color1);
    const color2Lab = sRGBtoLab(color2);

    console.log('color1Lab', color1Lab);
    console.log('color2Lab', color2Lab);

    const generateK = (x: number) => -40 * x + 40;

    const color3Gain = logisticBasedCurve(
      value / 100,
      sessionStartValue / 100,
      generateK(sessionStartValue / 100)
    );

    console.log('color3Gain', color3Gain);

    const color3Lab: Lab = [
      color1Lab[0] + color3Gain * (color2Lab[0] - color1Lab[0]),
      color1Lab[1] + color3Gain * (color2Lab[1] - color1Lab[1]),
      color1Lab[2] + color3Gain * (color2Lab[2] - color1Lab[2]),
    ];

    console.log('color3Lab', color3Lab);

    console.log('labToSRGB(color3Lab)', labToSRGB(color3Lab));

    return labToSRGB(color3Lab);
  }, [value]);

  const displaySize = 90;

  return (
    <Box padding={4}>
      <Box>グラデーションのテスト</Box>
      <Box display="flex" padding={4} gap={2}>
        <Box
          sx={{ backgroundColor: `rgba(${color1}, 1)` }}
          width={displaySize}
          height={displaySize}
        />
        <Box
          sx={{ backgroundColor: `rgba(${color2}, 1)` }}
          width={displaySize}
          height={displaySize}
        />
      </Box>
      <Box display="flex" padding={4} gap={2}>
        <TextField
          type="number"
          label="セッションスタート"
          variant="outlined"
          value={sessionStartValue}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setSessionStartValue(Number(value));
            }
          }}
        />
        <Box width={400}>
          <Slider
            value={sessionStartValue}
            onChange={(e, value) => {
              setSessionStartValue(value as number);
            }}
            min={0}
            max={100}
          />
        </Box>
      </Box>
      <Box display="flex" padding={4} gap={2}>
        <TextField
          type="number"
          label="CV率"
          variant="outlined"
          value={value}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setValue(Number(value));
            }
          }}
        />
        <Box width={400}>
          <Slider
            value={value}
            onChange={(e, value) => {
              setValue(value as number);
            }}
            min={0}
            max={100}
          />
        </Box>
      </Box>
      <Box display="flex" padding={4} gap={2}>
        <Box
          sx={{ backgroundColor: `rgba(${color3}, 1)` }}
          width={displaySize}
          height={displaySize}
        />
      </Box>
    </Box>
  );
};

export default Page;
