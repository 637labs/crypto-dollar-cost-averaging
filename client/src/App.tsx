import React, { useState, useEffect, useContext } from 'react';
import {
  Switch,
  Route,
  RouteProps,
  Redirect,
  useHistory
} from 'react-router-dom';
import './css/App.css';
import { getJson } from './HttpUtils';
import { AuthenticatedUser, AuthenticatedUserContext } from './UserContext';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

type ProtectedRouteProps = React.PropsWithChildren<RouteProps> & { onRedirect: (pathnameRedirectedFrom: string) => void };

function ProtectedRoute({ children, onRedirect, ...rest }: ProtectedRouteProps): JSX.Element {
  const authedUser = useContext(AuthenticatedUserContext);
  console.log('Rendered protected route...');
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (authedUser !== null) {
          console.log(`[User: ${authedUser}] Rendering children...`);
          return children;
        } else {
          console.log(`[User: ${authedUser}] Rendering redirect...`);
          onRedirect(location.pathname);
          return (
            <Redirect
              to={{
                pathname: "/",
                state: { from: location }
              }}
            />
          );
        }
      }
      }
    />
  );
}

function App(): JSX.Element {
  const [authedUser, setAuthedUser] = useState<AuthenticatedUser | null>(null);
  const [redirectedFrom, setRedirectedFrom] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    if (authedUser !== null) {
      console.log('User already logged in -- skipping server-side check.');
    } else {
      console.log('Checking logged in user...');
      getJson('/api/active-user')
        .then(response => {
          if (response.ok) {
            response.json()
              .then(result => {
                setAuthedUser({ displayName: result.displayName });
                console.info('Found logged in user.');

                if (redirectedFrom !== null) {
                  console.log(`Redirecting to ${redirectedFrom} after successful login...`);
                  setRedirectedFrom(null);
                  history.push(redirectedFrom);
                }
              });
          } else if (response.status === 401) {
            setAuthedUser(null);
            console.info('User is not logged in.');
          } else {
            console.error(`Fetching active user returned with non-OK status: ${response.status}`);
            setAuthedUser(null);
          }
        })
        .catch(error => {
          setAuthedUser(null);
          console.error(`Failed to fetch active user: ${error}`);
        });
    }
  }, [authedUser, redirectedFrom, history]);

  return (
    <div className="App">
      <AuthenticatedUserContext.Provider value={authedUser}>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <ProtectedRoute onRedirect={setRedirectedFrom} exact path="/dashboard">
            <Dashboard />
          </ProtectedRoute>
        </Switch>
        {/* {showConfigPage && (
            <ConfigurationPage
              userDisplayName={userDisplayName || ''}
              onAuthNeeded={() => { this.setState({ showLogin: true, showConfigPage: false, userDisplayName: null }) }}
            />
          )} */}
      </AuthenticatedUserContext.Provider>
    </div>
  );
}

export default App;
