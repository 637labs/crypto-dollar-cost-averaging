import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import { blue, yellow, green, purple, pink, deepOrange } from '@material-ui/core/colors';

import ApartmentIcon from '@material-ui/icons/Apartment';

const useStyles = makeStyles((theme) => ({
  section: {
    backgroundImage: 'url("nereus-assets/img/bg/pattern1.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },  
  container: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  iconWrapper: {
    backgroundColor: theme.palette.primary.main,
  },
  features: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(4)
    }
  },
  paper: {
    marginBottom: theme.spacing(3),
  },
  paperDown: {
    marginTop: -1 * theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(3),
    },
  },
  icon1: {
    backgroundColor: blue[100],
    color: blue[600],
  },
  icon2: {
    backgroundColor: yellow[100],
    color: yellow[800],
  },
  icon3: {
    backgroundColor: green[100],
    color: green[600],
  },
  icon4: {
    backgroundColor: purple[100],
    color: purple[600],
  },
  icon5: {
    backgroundColor: pink[100],
    color: pink[600],
  },
  icon6: {
    backgroundColor: deepOrange[100],
    color: deepOrange[600],
  },
}));

export default function Features(props) {
  const classes = useStyles();

  const content = {
    'badge': 'LOREM IPSUM',
    'header-p1': 'Lorem ipsum',
    'header-p2': 'dolor sit amet consectetur.',
    'description': 'Suspendisse aliquam tellus ante, porttitor mattis diam eleifend quis. Pellentesque pulvinar commodo eros sit amet finibus. Aenean et ornare erat.',    
    'primary-action': 'Action',
    'col1-header': 'Ut dui neque, volutpat ac erat quis, lobortis.',
    'col1-desc': 'In eget ligula ut est interdum finibus. Etiam consectetur, libero tincidunt vulputate fermentum.',
    'col2-header': 'Ut dui neque, volutpat ac erat quis, lobortis.',
    'col2-desc': 'In eget ligula ut est interdum finibus. Etiam consectetur, libero tincidunt vulputate fermentum.',
    'col3-header': 'Ut dui neque, volutpat ac erat quis, lobortis.',
    'col3-desc': 'In eget ligula ut est interdum finibus. Etiam consectetur, libero tincidunt vulputate fermentum.',
    'col4-header': 'Ut dui neque, volutpat ac erat quis, lobortis.',
    'col4-desc': 'In eget ligula ut est interdum finibus. Etiam consectetur, libero tincidunt vulputate fermentum.',
    ...props.content
  };

  return (
    <section className={classes.section}>
      <Container maxWidth="lg">
        <Box py={6}>
          <Grid container spacing={4}>
            <Grid item xs={12} lg={6}>
              <Box display="flex" height="100%">
                <Container maxWidth="sm" className={classes.container}>
                  <Typography variant="overline" color="textSecondary">{content['badge']}</Typography>
                  <Typography variant="h3" component="h2" gutterBottom={true}>
                    <Typography variant="h3" component="span" color="primary">{content['header-p1']} </Typography>
                    <Typography variant="h3" component="span">{content['header-p2']}</Typography>
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary" paragraph={true}>{content['description']}</Typography>
                  <Button variant="contained" color="secondary" className={classes.primaryAction}>{content['primary-action']}</Button>
                </Container>
              </Box>
            </Grid>
            <Grid item xs={12} lg={6} className={classes.features}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    <Box p={3}>
                      <Box display="flex" mb={2}>
                        <Avatar variant="rounded" className={clsx(classes.iconWrapper, classes.icon1)}>
                          <ApartmentIcon />
                        </Avatar>
                      </Box>
                      <div>
                        <Typography variant="h6" component="h3" gutterBottom={true}>{content['col1-header']}</Typography>
                        <Typography variant="body2" component="p" color="textSecondary">{content['col1-desc']}</Typography>
                      </div>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" className={classes.paper}>
                    <Box p={3}>
                      <Box display="flex" mb={2}>
                        <Avatar variant="rounded" className={clsx(classes.iconWrapper, classes.icon2)}>
                          <ApartmentIcon />
                        </Avatar>
                      </Box>
                      <div>
                        <Typography variant="h6" component="h3" gutterBottom={true}>{content['col2-header']}</Typography>
                        <Typography variant="body2" component="p" color="textSecondary">{content['col2-desc']}</Typography>
                      </div>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" className={clsx(classes.paper, classes.paperDown)}>
                    <Box p={3}>
                      <Box display="flex" mb={2}>
                        <Avatar variant="rounded" className={clsx(classes.iconWrapper, classes.icon3)}>
                          <ApartmentIcon />
                        </Avatar>
                      </Box>
                      <div>
                        <Typography variant="h6" component="h3" gutterBottom={true}>{content['col3-header']}</Typography>
                        <Typography variant="body2" component="p" color="textSecondary">{content['col3-desc']}</Typography>
                      </div>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" className={classes.paper}>
                    <Box p={3}>
                      <Box display="flex" mb={2}>
                        <Avatar variant="rounded" className={clsx(classes.iconWrapper, classes.icon4)}>
                          <ApartmentIcon />
                        </Avatar>
                      </Box>
                      <div>
                        <Typography variant="h6" component="h3" gutterBottom={true}>{content['col4-header']}</Typography>
                        <Typography variant="body2" component="p" color="textSecondary">{content['col4-desc']}</Typography>
                      </div>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </section>
  );
}