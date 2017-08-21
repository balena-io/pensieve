import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import { injectGlobal } from 'styled-components';
import { Provider, Button, Fixed } from 'rebass';
import { connect } from 'react-redux';
import _ from 'lodash';
import './app.css';
import './styles/github-markdown.css';
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
`;

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content,
});

events.on('commit', () => {
  store.dispatch({ type: 'SET_CONTENT', value: DocumentService.getJSON() });
});

const WrappedDocumentViewer = connect(mapStatetoProps)(DocumentViewer);
const WrappedSchemaEditor = connect(mapStatetoProps)(SchemaEditor);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      isLoading: false,
    };

    store.dispatch({ type: 'SET_CONFIG', value: this.props.config });

    DocumentService.setConfig(this.props.config);

    this.runPostLogin = this.runPostLogin.bind(this);
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
    this.setState({
      isLoggedIn: true,
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
  }

  render() {
    const schemaIsEditable = _.isString(this.props.config.schema);

    if (!this.state.isLoggedIn) {
      return (
        <Provider>
          <Login onLogin={this.runPostLogin} />
        </Provider>
      );
    }

    if (this.state.isLoading) {
      return (
        <Provider>
          <div className="container">
            <FontAwesome spin name="cog" />
          </div>
        </Provider>
      );
    }

    if (this.state.editSchema) {
      return (
        <Provider>
          <Fixed m={2} right top>
            <Button bg="red" onClick={() => this.logout()}>
              Logout
            </Button>
          </Fixed>
          <WrappedSchemaEditor store={store} done={() => this.setState({ editSchema: false })} />
        </Provider>
      );
    }

    return (
      <Provider>
        <Fixed m={2} right top>
          <Button bg="red" onClick={() => this.logout()}>
            Logout
          </Button>
        </Fixed>
        {schemaIsEditable &&
          <div className="container">
            <Button onClick={() => this.setState({ editSchema: true })}>Edit schema</Button>
          </div>}
        <WrappedDocumentViewer store={store} />
      </Provider>
    );
  }
}

App.propTypes = {
  config: PropTypes.object.isRequired,
};

export default App;
