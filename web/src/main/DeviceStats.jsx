import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 2.5, 1.5),
  },
  count: {
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    color: theme.palette.text.secondary,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  breakdown: {
    display: 'flex',
    gap: theme.spacing(1.5),
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: theme.spacing(0.75),
  },
  offline: {
    backgroundColor: theme.palette.error.main,
  },
  unknown: {
    backgroundColor: theme.palette.neutral.main,
  },
}));

const DeviceStats = ({ devices }) => {
  const { classes, cx } = useStyles();
  const t = useTranslation();

  const counts = useMemo(() => {
    const result = { online: 0, offline: 0, unknown: 0 };
    devices.forEach((device) => {
      if (result[device.status] !== undefined) {
        result[device.status] += 1;
      } else {
        result.unknown += 1;
      }
    });
    return result;
  }, [devices]);

  return (
    <Box className={classes.root}>
      <Box>
        <Typography variant="h4" className={classes.count}>
          {counts.online}
        </Typography>
        <Typography variant="caption" className={classes.label}>
          {t('deviceStatusOnline')}
        </Typography>
      </Box>
      <Box className={classes.breakdown}>
        <Box className={classes.breakdownItem}>
          <span className={cx(classes.dot, classes.offline)} />
          <Typography variant="body2" color="text.secondary">
            {counts.offline}
          </Typography>
        </Box>
        <Box className={classes.breakdownItem}>
          <span className={cx(classes.dot, classes.unknown)} />
          <Typography variant="body2" color="text.secondary">
            {counts.unknown}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DeviceStats;
