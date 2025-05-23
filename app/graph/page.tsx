import { Box } from '@mui/material';
import { GraphTemplate } from './_custom-graph/graph-template';
import { Graph1 } from './_custom-graph/graph1';
import { data1, data2, dateRange } from './_custom-graph/sample-data';

const Page = () => {
  return (
    <Box padding={4}>
      <Box>グラフの検証</Box>
      <Box padding={2}>
        <GraphTemplate title="curveMonotoneX">
          <Graph1
            data={[
              { data: data1, color: '#ABFF29' },
              { data: data2, color: '#FF29DB' },
            ]}
            range={dateRange}
            options={{ curve: 'curveMonotoneX' }}
          />
        </GraphTemplate>
        <GraphTemplate title="curveCardinal.tension(0.8)">
          <Graph1
            data={[
              { data: data1, color: '#29DBFF' },
              { data: data2, color: '#2994FF' },
            ]}
            range={dateRange}
            options={{ curve: 'curveCardinal.tension(0.8)' }}
          />
        </GraphTemplate>
      </Box>
    </Box>
  );
};

export default Page;
