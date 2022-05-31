import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LayersIcon from '@material-ui/icons/Layers';
import FilterHdrIcon from '@material-ui/icons/FilterHdr';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import CloudDoneIcon from '@material-ui/icons/CloudDone';

import { AuthenticatedUserContext } from '../../UserContext';
import { CoinbaseLoginButton } from '../../Login';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: 70
  },
  brand: {
    lineHeight: 1,
    marginRight: theme.spacing(5)
  },
  link: {
    marginRight: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  secondaryAction: {
    marginLeft: 'auto',
    marginRight: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  primaryAction: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  menuButton: {
    marginLeft: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  iconWrapper: {
    minWidth: 40,
  },
  icon: {
    color: theme.palette.text.hint
  },
  drawerContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(3),
    width: 300,
  }
}));

interface NavigationContent {
  brand: { image: string, width: number } | { text: string };
  link1: string;
  link2: string;
  link3: string;
  link4: string;
  link5: string;
  primaryAction: string;
}

interface Props {
  content: NavigationContent;
}

export default function Navigation(props: Props): JSX.Element {
  const classes = useStyles();
  let brand;

  if ('image' in props.content.brand) {
    brand = <img src={props.content.brand.image} alt="" width={props.content.brand.width} />;
  } else {
    brand = props.content.brand.text || '';
  }

  const [state, setState] = React.useState({ open: false });

  const toggleDrawer = (open: boolean) => (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    setState({ ...state, open });
  };

  return (
    <AppBar position="static" color="inherit">
      <Toolbar className={classes.toolbar}>
        <Link href="#" color="primary" underline="none" variant="h5" className={classes.brand}>
          {brand}
        </Link>
        <Link href="#" color="textPrimary" variant="body2" className={classes.link}>
          {props.content.link1}
        </Link>
        <Link href="#" color="textPrimary" variant="body2" className={classes.link}>
          {props.content.link2}
        </Link>
        <Link href="#" color="textPrimary" variant="body2" className={classes.link}>
          {props.content.link3}
        </Link>
        <Link href="#" color="textPrimary" variant="body2" className={classes.link}>
          {props.content.link4}
        </Link>
        <Link href="#" color="textPrimary" variant="body2" className={classes.secondaryAction}>
          {props.content.link5}
        </Link>
        <AuthenticatedUserContext.Consumer>
          {authedUser => !authedUser && (<CoinbaseLoginButton classes={classes} />)}
        </AuthenticatedUserContext.Consumer>
        <IconButton edge="start" color="inherit" aria-label="menu" className={classes.menuButton} onClick={toggleDrawer(true)}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer anchor="left" open={state.open} onClose={toggleDrawer(false)}>
        <div className={classes.drawerContainer}>
          <Box mb={1} ml={2} pb={2} border={1} borderTop={0} borderLeft={0} borderRight={0} borderColor="background.emphasis">
            <Link href="#" color="primary" underline="none" variant="h5" className={classes.link}>
              {brand}
            </Link>
          </Box>
          <List>
            <ListItem button key={props.content.link1}>
              <ListItemIcon className={classes.iconWrapper}>
                <LayersIcon className={classes.icon} />
              </ListItemIcon>
              <ListItemText primary={props.content.link1} />
            </ListItem>
            <ListItem button key={props.content.link2}>
              <ListItemIcon className={classes.iconWrapper}>
                <FilterHdrIcon className={classes.icon} />
              </ListItemIcon>
              <ListItemText primary={props.content.link2} />
            </ListItem>
            <ListItem button key={props.content.link3}>
              <ListItemIcon className={classes.iconWrapper}>
                <DirectionsBusIcon className={classes.icon} />
              </ListItemIcon>
              <ListItemText primary={props.content.link3} />
            </ListItem>
            <ListItem button key={props.content.link4}>
              <ListItemIcon className={classes.iconWrapper}>
                <NotificationImportantIcon className={classes.icon} />
              </ListItemIcon>
              <ListItemText primary={props.content.link4} />
            </ListItem>
            <ListItem button key={props.content.link5}>
              <ListItemIcon className={classes.iconWrapper}>
                <CloudDoneIcon className={classes.icon} />
              </ListItemIcon>
              <ListItemText primary={props.content.link5} />
            </ListItem>
          </List>
          <Box mt={1} ml={2} pt={3} border={1} borderBottom={0} borderLeft={0} borderRight={0} borderColor="background.emphasis">
            <Button variant="contained" color="secondary" fullWidth>{props.content.primaryAction}</Button>
          </Box>
        </div>
      </Drawer>
    </AppBar>
  );
}