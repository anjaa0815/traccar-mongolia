import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, IconButton, Menu, MenuItem, Typography, Badge, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';

const useStyles = makeStyles()((theme) => ({
  root: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100%',
    width: theme.dimensions.appSidebarWidth,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    backgroundColor: theme.palette.primary.main,
    zIndex: 10,
    '@media print': {
      display: 'none',
    },
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: theme.shape.borderRadius,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  buttonActive: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
}));

const AppSidebar = () => {
  const { classes, cx } = useStyles();
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
      <Box className={classes.items}>
        <Tooltip title={t('mapTitle')} placement="right">
          <IconButton
            className={cx(classes.button, selected === 'map' && classes.buttonActive)}
            onClick={(e) => handleSelection(e, 'map')}
          >
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        {!disableReports && (
          <Tooltip title={t('reportTitle')} placement="right">
            <IconButton
              className={cx(classes.button, selected === 'reports' && classes.buttonActive)}
              onClick={(e) => handleSelection(e, 'reports')}
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        )}
        {!readonly && (
          <Tooltip title={t('settingsTitle')} placement="right">
            <IconButton
              className={cx(classes.button, selected === 'settings' && classes.buttonActive)}
              onClick={(e) => handleSelection(e, 'settings')}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box className={classes.items}>
        {readonly ? (
          <Tooltip title={t('loginLogout')} placement="right">
            <IconButton className={classes.button} onClick={(e) => handleSelection(e, 'logout')}>
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t('settingsUser')} placement="right">
            <IconButton
              className={cx(classes.button, selected === 'account' && classes.buttonActive)}
              onClick={(e) => handleSelection(e, 'account')}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>
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
