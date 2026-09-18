import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#0f172a' : '#f8fafc',
    paper: darkMode ? '#1e293b' : '#ffffff',
  },
  divider: darkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)',
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? '#60a5fa' : '#2563eb'),
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? '#fbbf24' : '#f59e0b'),
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
});
