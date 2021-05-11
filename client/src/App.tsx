import React from 'react';
import './App.css';
import { ConfigurationPage } from './ConfigurationPage';
import { LoginModal } from './Login';
import { getJson } from './HttpUtils';


interface State {
  showLogin: boolean;
  showConfigPage: boolean;
  userDisplayName: string | null;
}

class App extends React.Component<{}, State> {
  state = { showLogin: false, showConfigPage: false, userDisplayName: null };

  componentDidMount() {
    getJson('/api/active-user')
      .then(response => {
        if (response.ok) {
          response.json()
            .then(result => this.setState({ userDisplayName: result.displayName, showConfigPage: true, showLogin: false }));
        } else if (response.status === 401) {
          this.setState({ showLogin: true, showConfigPage: false })
        } else {
          console.error(`Fetching active user returned with non-OK status: ${response.status}`)
          this.setState({ showLogin: true });
        }
      })
      .catch(error => {
        this.setState({ showLogin: true });
        console.error(`Failed to fetch active user: ${error}`)
      })
  }

  render() {
    const { showLogin, showConfigPage, userDisplayName } = this.state;
    return (
      <div className="App">
        {showLogin && (<LoginModal />)}
        {showConfigPage && (
          <ConfigurationPage
            userDisplayName={userDisplayName || ''}
            onAuthNeeded={() => { this.setState({ showLogin: true, showConfigPage: false, userDisplayName: null }) }}
          />
        )}
      </div>
    );
  }
}

export default App;
