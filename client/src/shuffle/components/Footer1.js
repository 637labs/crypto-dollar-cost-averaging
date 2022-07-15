import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  box: {
    margin: 25,
  },
  spacer: {
    flexGrow: 1,
  },
}));

export default function Footer(props) {
  const classes = useStyles();

  const content = {
    'copy': '© 2020 nckl All rights reserved.',
    ...props.content
  };

  return (
    <footer>
      <Box py={6} display="flex" className={classes.box} >
        <div className={classes.spacer} />
        <Typography color="textSecondary" component="p" variant="caption" gutterBottom={false}>{content['copy']}</Typography>
      </Box>
    </footer>
  );
}