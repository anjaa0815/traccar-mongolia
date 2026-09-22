import { ListItemButton, ListItemIcon, ListItemText, Badge, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { alpha } from '@mui/material/styles';

const useStyles = makeStyles()((theme) => ({
  item: {
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  itemActive: {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  itemIcon: {
    minWidth: 40,
    color: 'inherit',
  },
}));

const AppSidebarItem = ({ active, icon, label, showBadge, onClick }) => {
  const { classes, cx } = useStyles();
  return (
    <ListItemButton className={cx(classes.item, active && classes.itemActive)} onClick={onClick}>
      <ListItemIcon className={classes.itemIcon}>
        {showBadge !== undefined ? (
          <Badge color="error" variant="dot" overlap="circular" invisible={!showBadge}>
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </ListItemIcon>
      <ListItemText
        primary={label}
        slots={{ primary: Typography }}
        slotProps={{
          primary: { variant: 'body2', fontWeight: active ? 600 : 500, noWrap: true },
        }}
      />
    </ListItemButton>
  );
};

export default AppSidebarItem;
