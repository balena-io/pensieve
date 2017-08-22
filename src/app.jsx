import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import { injectGlobal } from 'styled-components';
import { Provider } from 'rebass';
import { connect } from 'react-redux';
import './app.css';
import './styles/github-markdown.css';
import Header from './components/header';
import DocumentViewer from './components/document-viewer';
import Login from './components/login';
import * as GitHubService from './services/github';
import * as DocumentService from './services/document';
import events from './services/events';
import store from './store';
import SchemaEditor from './components/schema-editor';
import { loadRulesFromUrl } from './services/path';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
  font-family: Roboto,Arial,sans-serif;
`;

const theme = {
  font: 'Roboto,Arial,sans-serif',
  monospace: 'Ubuntu Mono Web,Courier New,monospace',
};

events.on('commit', () => {
  store.dispatch({ type: 'SET_CONTENT', value: DocumentService.getJSON() });
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };

    store.dispatch({ type: 'SET_CONFIG', value: this.props.config });

    DocumentService.setConfig(this.props.config);

    let previouslyLoggedIn = !!store.getState().isLoggedIn;

    store.subscribe(() => {
      const { isLoggedIn } = store.getState();

      if (isLoggedIn === previouslyLoggedIn) {
        return;
      }

      previouslyLoggedIn = isLoggedIn;

      if (!isLoggedIn) {
        return;
      }

      this.setState({
        username: null,
        password: null,
        isLoading: true,
      });

      GitHubService.loadSchema(this.props.config).then((schema) => {
        store.dispatch({ type: 'SET_SCHEMA', value: schema });
        store.dispatch({ type: 'SET_RULES', value: loadRulesFromUrl(schema) });
        GitHubService.getFile(this.props.config.repo).then((source) => {
          DocumentService.setSource(source);
          store.dispatch({ type: 'SET_CONTENT', value: DocumentService.getJSON() });
          this.setState({
            isLoading: false,
          });
        });
      });
    });
  }

  render() {
    if (!this.props.isLoggedIn) {
      return (
        <Provider theme={theme}>
          <Header />
          <Login />
        </Provider>
      );
    }

    if (this.state.isLoading) {
      return (
        <Provider theme={theme}>
          <Header />
          <div className="container">
            <FontAwesome spin name="cog" />
          </div>
        </Provider>
      );
    }

    if (this.props.isEditingSchema) {
      return (
        <Provider theme={theme}>
          <Header />
          <SchemaEditor />
        </Provider>
      );
    }

    return (
      <Provider theme={theme}>
        <Header />
        <DocumentViewer store={store} />
      </Provider>
    );
  }
}

App.propTypes = {
  config: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

const mapStatetoProps = state => ({
  isLoggedIn: state.isLoggedIn,
  isEditingSchema: state.isEditingSchema,
});

export default connect(mapStatetoProps)(App);
