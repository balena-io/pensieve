import React, { Component } from 'react';
import { injectGlobal } from 'styled-components';
import { Provider, Input, Panel, PanelHeader, Box, Button, Text } from 'rebass';
import 'font-awesome/css/font-awesome.css';
import './App.css';
import './styles/github-markdown.css';
import DocumentViewer from './components/document-viewer';
import * as GitHubService from './services/github';
import * as DocumentService from './services/document';
import events from './services/events';

injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
`;

class App extends Component {
  constructor(props) {
    super(props);

    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    this.state = {
      username: username || '',
      password: password || '',
      isLoggedIn: false,
      loginError: null,
      content: '',
      filterRules: [],
    };

    DocumentService.setConfig(this.props.config);
    GitHubService.setConfig(this.props.config.repo);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);

    if (username && password) {
      this.login();
    }

    events.on('commit', () => {
      this.setState({ content: DocumentService.getJSON() });
    });
  }

  handleChange(e, attribute) {
    const update = {};
    update[attribute] = e.target.value;
    this.setState(update);
  }

  login(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({ loginError: null });

    const { username, password } = this.state;
    if (!username || !password) {
      return;
    }

    GitHubService.login(username, password)
      .then(() => {
        this.setState({ isLoggedIn: true });
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        GitHubService.getFile(this.props.config.repo).then((source) => {
          DocumentService.setSource(source);
          this.setState({ content: DocumentService.getJSON() });
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          loginError: 'Incorrect username or password',
        });
      });
  }

  logout() {
    localStorage.clear();
    window.location = '/';
  }

  render() {
    if (!this.state.isLoggedIn) {
      return (
        <Provider>
          <div className="login-form">
            <Panel>
              <PanelHeader>Login to GitHub</PanelHeader>
              {this.state.loginError &&
                <Box p={3}>
                  <Text color="red">
                    {this.state.loginError}
                  </Text>
                </Box>}
              <Box p={3}>
                <form onSubmit={this.login}>
                  <Input
                    placeholder="username"
                    value={this.state.username}
                    onChange={e => this.handleChange(e, 'username')}
                  />
                  <Input
                    placeholder="password"
                    type="password"
                    value={this.state.password}
                    onChange={e => this.handleChange(e, 'password')}
                  />
                  <Button>Login</Button>
                </form>
              </Box>
            </Panel>
          </div>
        </Provider>
      );
    }

    return (
      <Provider>
        <div className="container">
          <Button onClick={this.logout}>Logout</Button>
        </div>
        <DocumentViewer config={this.props.config} content={this.state.content} />
      </Provider>
    );
  }
}

export default App;
