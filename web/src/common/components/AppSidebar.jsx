import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import AppSidebarItem from './AppSidebarItem';
import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';
import useDarkMode from '../util/useDarkMode';

const useStyles = makeStyles()((theme) => ({
  root: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100%',
    width: theme.dimensions.appSidebarWidth,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    zIndex: 10,
    '@media print': {
      display: 'none',
    },
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    padding: theme.spacing(2.5, 2.5, 2),
  },
  brandLogo: {
    width: 28,
    height: 28,
  },
  brandName: {
    fontWeight: 700,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1.5),
    overflowY: 'auto',
  },
  footer: {
    padding: theme.spacing(1, 1.5, 1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

const AppSidebar = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const devices = useSelector((state) => state.devices.items);
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const [darkMode, toggleDarkMode] = useDarkMode();

  const [anchorEl, setAnchorEl] = useState(null);

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) {
      return 'account';
    }
    if (location.pathname.startsWith('/settings')) {
      return 'settings';
    }
    if (location.pathname.startsWith('/reports')) {
      return 'reports';
    }
    if (location.pathname === '/') {
      return 'map';
    }
    return null;
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);

    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(',')
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'map':
        navigate('/');
        break;
      case 'reports': {
        let id = selectedDeviceId;
        if (id == null) {
          const deviceIds = Object.keys(devices);
          if (deviceIds.length === 1) {
            id = deviceIds[0];
          }
        }

        if (id != null) {
          navigate(`/reports/combined?deviceId=${id}`);
        } else {
          navigate('/reports/combined');
        }
        break;
      }
      case 'settings':
        navigate('/settings/preferences');
        break;
      case 'account':
        setAnchorEl(event.currentTarget);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const selected = currentSelection();

  return (
    <Box className={classes.root}>
      <Box className={classes.brand}>
        <img className={classes.brandLogo} src="/logo.svg" alt="" />
        <Typography variant="subtitle1" className={classes.brandName} noWrap>
          SIM Global Robotics
        </Typography>
      </Box>
      <Divider />
      <Box className={classes.nav}>
        <AppSidebarItem
          active={selected === 'map'}
          icon={<MapIcon fontSize="small" />}
          label={t('mapTitle')}
          showBadge={socket === false}
          onClick={(e) => handleSelection(e, 'map')}
        />
        {!disableReports && (
          <AppSidebarItem
            active={selected === 'reports'}
            icon={<DescriptionIcon fontSize="small" />}
            label={t('reportTitle')}
            onClick={(e) => handleSelection(e, 'reports')}
          />
        )}
        {!readonly && (
          <AppSidebarItem
            active={selected === 'settings'}
            icon={<SettingsIcon fontSize="small" />}
            label={t('settingsTitle')}
            onClick={(e) => handleSelection(e, 'settings')}
          />
        )}
      </Box>
      <Divider />
      <Box className={classes.footer}>
        <AppSidebarItem
          active={false}
          icon={darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          label={t('settingsDarkMode')}
          onClick={toggleDarkMode}
        />
        {readonly ? (
          <AppSidebarItem
            active={false}
            icon={<ExitToAppIcon fontSize="small" />}
            label={t('loginLogout')}
            onClick={(e) => handleSelection(e, 'logout')}
          />
        ) : (
          <AppSidebarItem
            active={selected === 'account'}
            icon={<PersonIcon fontSize="small" />}
            label={user?.name || t('settingsUser')}
            onClick={(e) => handleSelection(e, 'account')}
          />
        )}
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">{t('settingsUser')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppSidebar;
