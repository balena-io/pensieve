import React, { Component } from 'react';
import { injectGlobal } from 'styled-components';
import { Provider, Button, Fixed } from 'rebass';
import 'font-awesome/css/font-awesome.css';
import './App.css';
import './styles/github-markdown.css';
import DocumentViewer from './components/document-viewer';
import Login from './components/login';
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

    this.state = {
      isLoggedIn: false,
      content: '',
      filterRules: [],
    };

    DocumentService.setConfig(this.props.config);
    GitHubService.setConfig(this.props.config.repo);

    this.runPostLogin = this.runPostLogin.bind(this);

    events.on('commit', () => {
      this.setState({ content: DocumentService.getJSON() });
    });
  }

  logout() {
    localStorage.clear();
    this.setState({
      username: null,
      password: null,
      isLoggedIn: false,
    });
  }

  runPostLogin() {
    this.setState({ isLoggedIn: true });
    GitHubService.getFile(this.props.config.repo).then((source) => {
      DocumentService.setSource(source);
      this.setState({ content: DocumentService.getJSON() });
    });
  }

  render() {
    if (!this.state.isLoggedIn) {
      return (
        <Provider>
          <Login onLogin={this.runPostLogin} />
        </Provider>
      );
    }

    return (
      <Provider>
        <Fixed m={2} right top>
          <Button bg="red" onClick={e => this.logout()}>
            Logout
          </Button>
        </Fixed>
        <DocumentViewer config={this.props.config} content={this.state.content} />
      </Provider>
    );
  }
}

export default App;
