import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Redirect,
  Link
} from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import HomeIcon from '@material-ui/icons/Home';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

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
  profile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    }
  },
  link: {
    textDecoration: 'none',
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
          <IconButton edge="start" color="inherit" aria-label="menu">
            <HomeIcon />
          </IconButton>
          <Link className={classes.link} to="/dashboard" >
            <Button >
              <Typography variant="body1" color="textPrimary" paragraph={false}>
                Dashboard
              </Typography>
            </Button>
          </Link>
          <Link className={classes.link} style={{ marginRight: 'auto' }} to="/keyconfig" >
            <Button >
              <Typography variant="body1" color="textPrimary" paragraph={false}>
                API Key
              </Typography>
            </Button>
          </Link>
          <Typography variant="body1" color="inherit" className={classes.profile} paragraph={false}>
            Logged in as {authedUser.displayName}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
