import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Redirect,
  Link
} from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
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

  if (authedUser === null) {
    return (
      <Redirect to='/' />
    )
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Link to="/dashboard" >Dashboard</Link>
          <Link style={{ marginRight: 'auto' }} to="/keyconfig" >API Key</Link>
          <Typography variant="body1" color="inherit" className={classes.profile} paragraph={false}>
            Logged in as {authedUser.displayName}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
