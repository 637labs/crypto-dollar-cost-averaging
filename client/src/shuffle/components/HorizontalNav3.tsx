import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';

import { AuthenticatedUserContext } from '../../UserContext';
import { CoinbaseLoginButton } from '../../Login';

const useStyles = makeStyles((theme) => ({
  spacer: {
    flexGrow: 1,
  },
}));

interface NavigationContent {
  brand: { image: string, width: number } | { text: string };
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

  return (
    <AppBar position="static" color="inherit">
      <Toolbar>
        <Link href="#" color="primary" underline="none" variant="h5" >
          {brand}
        </Link>
        <div className={classes.spacer} />
        <AuthenticatedUserContext.Consumer>
          {authedUser => !authedUser && (<CoinbaseLoginButton classes={classes} />)}
        </AuthenticatedUserContext.Consumer>
      </Toolbar>
    </AppBar>
  );
}