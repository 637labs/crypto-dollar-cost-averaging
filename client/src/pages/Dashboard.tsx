import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import VerticalNav from '../components/VerticalNav';
import DashboardContent from '../components/DashboardContent';
import { Container } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: {
    minHeight: 70
  },
  root: {
    display: 'flex',
  },
}))

export default function Dashboard(): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <VerticalNav />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Container>
          <DashboardContent />
        </Container>
      </main>
    </div>
  );
}

