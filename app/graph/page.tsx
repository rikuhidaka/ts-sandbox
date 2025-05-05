import { Box } from '@mui/material';
import { Graph1 } from './_custom-graph/graph1';
import { Graph2 } from './_custom-graph/graph2';
import { data, dateRange } from './_custom-graph/sample-data';

const Page = () => {
  return (
    <Box padding={4}>
      <Box>グラフの検証</Box>
      <Box padding={2}>
        <Graph1 data={data} range={dateRange} />
        <Graph2 data={data} range={dateRange} />
      </Box>
    </Box>
  );
};

export default Page;
