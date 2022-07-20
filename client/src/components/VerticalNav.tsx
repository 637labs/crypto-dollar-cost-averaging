import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Redirect,
  Link as RouterLink,
} from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import MenuIcon from '@material-ui/icons/Menu';
import LayersIcon from '@material-ui/icons/Layers';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';

import { AuthenticatedUserContext } from '../UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.main,
  },
  toolbar: {
    minHeight: 70
  },
  menuButton: {
    display: 'none',
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      display: 'inline-flex',
    }
  },
  linkBrand: {
    lineHeight: 1,
    marginRight: 'auto',
  },
  iconWrapper: {
    minWidth: 40,
  },
  icon: {
    color: theme.palette.text.hint,
  },
  drawerRoot: {
    width: 300,
    flexShrink: 0,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    }
  },
  drawerContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(3),
    width: 300,
  },
  profile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    }
  },
}
));

export default function VerticalNav(): JSX.Element {
  const authedUser = useContext(AuthenticatedUserContext);
  const classes = useStyles();

  const [state, setState] = React.useState({ open: false });

  const toggleDrawer = (open: boolean) => (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    setState({ ...state, open });
  };

  if (authedUser === null) {
    return (
      <Redirect to='/' />
    )
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Link href="#" color="inherit" underline="none" variant="h5" className={classes.linkBrand}>
            <img src="nereus-assets/img/nereus-dark.png" alt="" width="110" />
          </Link>
          <Typography variant="body1" color="inherit" className={classes.profile} paragraph={false}>
            Logged in as {authedUser.displayName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer className={classes.drawerRoot} variant="permanent">
        <div className={classes.toolbar} />
        <div className={classes.drawerContainer}>
          {VerticalNavList()}
        </div>
      </Drawer>
      <Drawer anchor="left" open={state.open} onClose={toggleDrawer(false)}>
        <div className={classes.drawerContainer}>
          <Box mb={1} ml={2} pb={2} border={1} borderTop={0} borderLeft={0} borderRight={0} borderColor="background.emphasis">
            <Link href="#" color="primary" underline="none" variant="h5" className={classes.linkBrand}>
              <img src="nereus-assets/img/nereus-light.png" alt="" width="110" />
            </Link>
          </Box>
          {VerticalNavList()}
        </div>
      </Drawer>
    </div>
  );
}

function VerticalNavList(): JSX.Element {
  const classes = useStyles();
  const FancyLink = React.forwardRef(({ ...props }, ref) => {
    return (
      <a  {...props}>
        {props.children}
      </a>
    )
  })

  return (
    <List>
      <RouterLink to="/dashboard" component={FancyLink}>
        <ListItem button key="Dashboard">
          <ListItemIcon className={classes.iconWrapper}>
            <LayersIcon className={classes.icon} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </RouterLink>
      <RouterLink to="/keyconfig" component={FancyLink}>
        <ListItem button key="API Key Configuration">
          <ListItemIcon className={classes.iconWrapper}>
            <DirectionsBusIcon className={classes.icon} />
          </ListItemIcon>
          <ListItemText primary="API Key Configuration" />
        </ListItem>
      </RouterLink>
    </List>
  );
}