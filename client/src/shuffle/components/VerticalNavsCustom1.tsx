import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Redirect
} from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
// import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

import MenuIcon from '@material-ui/icons/Menu';
// import NotificationsIcon from '@material-ui/icons/Notifications';
import LayersIcon from '@material-ui/icons/Layers';
import FilterHdrIcon from '@material-ui/icons/FilterHdr';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';

import { AuthenticatedUserContext } from '../../UserContext';
import ConfigurationPage from '../../ConfigurationPage';

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
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}
));

interface Props { }

export default function Component(props: Props): JSX.Element {
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
      <main className={classes.content}>
        <Toolbar className={classes.toolbar} />
        <div>
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Container>
                <ConfigurationPage />
              </Container>
            </Grid>
          </Grid>
        </div>
      </main>
    </div>
  );
}

function VerticalNavList(): JSX.Element {
  const classes = useStyles();

  return (
    <List>
      <ListItem button key="Dashboard">
        <ListItemIcon className={classes.iconWrapper}>
          <LayersIcon className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem button key="Edit contributions">
        <ListItemIcon className={classes.iconWrapper}>
          <FilterHdrIcon className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Edit contributions" />
      </ListItem>
      <ListItem button key="Linked portfolio">
        <ListItemIcon className={classes.iconWrapper}>
          <DirectionsBusIcon className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary="Linked portfolio" />
      </ListItem>
    </List>
  );
}