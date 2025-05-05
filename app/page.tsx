import { Box, Link } from '@mui/material';

/**
 * インデックスページ
 * @param props - コンポーネントのprops
 */
const Page = () => {
  return (
    <Box>
      <Box>
        <Link href="/color">グラデーションの検証</Link>
      </Box>
      <Box>
        <Link href="/graph">グラフの検証</Link>
      </Box>
    </Box>
  );
};

export default Page;
