import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

const flatShadow = (opacity) => `0 1px 2px rgba(15, 23, 42, ${opacity})`;
const flatShadows = [
  'none',
  flatShadow(0.06),
  flatShadow(0.07),
  flatShadow(0.08),
  ...Array(21).fill(flatShadow(0.1)),
];

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'Roboto,Segoe UI,Helvetica Neue,Arial,sans-serif',
          h6: {
            fontWeight: 600,
          },
          button: {
            fontWeight: 500,
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 10,
        },
        shadows: flatShadows,
        palette: palette(server, darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
