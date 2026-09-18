import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import usePersistedState from './usePersistedState';

// Priority: the viewer's own manual choice, then the server-forced setting
// (if an admin configured one), then the OS/browser preference.
export default () => {
  const server = useSelector((state) => state.session.server);
  const [override, setOverride] = usePersistedState('darkModeOverride', null);
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const serverDarkMode = server?.attributes?.darkMode;
  const darkMode = override !== null ? override : (serverDarkMode !== undefined ? serverDarkMode : preferDarkMode);

  const toggle = () => setOverride(!darkMode);

  return [darkMode, toggle];
};
