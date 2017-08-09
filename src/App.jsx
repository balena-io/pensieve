import React, { Component } from 'react';
import './App.css';
import './styles/github-markdown.css';
import Filters from './Filters.jsx'
import Editor from './Editor.jsx'
import {
  Provider,
  Input,
  Panel,
  PanelHeader,
  PanelFooter,
  Box,
  Subhead,
  Button,
  Text,
} from 'rebass';
import { injectGlobal } from 'styled-components'

const GitHub = require('github-api')
const jsyaml = require('js-yaml');
const util = require('./util');
const createHistory = require('history').createBrowserHistory;
const history = createHistory();
const qs = require('qs');

const SchemaSeive = require('./services/filter');
const seive = SchemaSeive();

injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
`

let gh = null;
let repo = null;

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
    }

    this.login = this.login.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.setContent = this.setContent.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addFilterRule = this.addFilterRule.bind(this);
    this.removeFilterRule = this.removeFilterRule.bind(this);
    this.editFilterRule = this.editFilterRule.bind(this);
    this.openEditor = this.openEditor.bind(this);
    this.commitChanges = this.commitChanges.bind(this);

    if (username && password) {
      this.login();
    }
  }

  openEditor() {
    this.setState({ showEditor: true });
  }

  addFilterRule(rule) {
    const rules = this.state.filterRules;
    rules.push(rule);
    this.setState({ filterRules: rules });

    this.runFilter(rules);
  }

  editFilterRule(rule) {
    const rules = this.state.filterRules.map((r) =>
      r.hash === rule ? rule : r);

    this.setState({ filterRules: rules });

    this.runFilter(rules);
  }

  removeFilterRule(rule) {
    const rules = this.state.filterRules.filter((r) => r.hash !== rule.hash);
    this.setState({ filterRules: rules });

    this.runFilter(rules);
  }

  runFilter(rules, fileSource) {
    // Only filter if there is source material available (it might still be loading)
    if (!this.state.fileSource) {
      return;
    }
    if (!fileSource) {
      fileSource = this.state.fileSource;
    }
    let source = jsyaml.load(fileSource);
    if (this.props.config.contentPath) {
      const pathComponents = this.props.config.contentPath.split('.');
      while(pathComponents.length) {
        source = source[pathComponents.shift()];
      }
    }

    rules.forEach((rule) => {
      source = seive.filter(source, rule);
    });

    this.setState({ content: util.json2html(source) });

    // Update url query string
    const { pathname } = history.location;
    history.push({
      pathname,
      search: qs.stringify(rules.map(({ name, operator, value }) => ({
        n: name,
        o: operator,
        v: value,
      }))),
    });
  }

  handleChange(e, attribute) {
    let update = {}
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

    gh = new GitHub({
      username,
      password
    });

    gh.getUser().getProfile()
    .then((resp) => {
      if (resp.status === 200) {
        this.setState({isLoggedIn: true});
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        repo = gh.getRepo(this.props.config.repo.account, this.props.config.repo.name)
        this.loadFile()
        .then(() => {
          this.setContent();
        });
      }
    })
    .catch((err) => {
      console.error(err);
      this.setState({
        loginError: 'Incorrect username or password'
      });
    });
  }

  commitChanges({ message, content }) {
    repo.writeFile(
      this.props.config.repo.ref,
      this.props.config.repo.file,
      content,
      message,
      { encode: true }
    )
    .then((resp) => {
      this.setState({
        fileSource: content,
        showEditor: false,
      });

      this.runFilter(this.state.filterRules, content)
    });
  }

  loadFile() {
    return repo.getContents(this.props.config.repo.ref, this.props.config.repo.file)
    .then(({ data }) => {
      const rawYaml = atob(data.content);
      this.setState({ fileSource: rawYaml });
    });
  }

  setContent() {
    let source = jsyaml.load(this.state.fileSource);
    if (this.props.config.contentPath) {
      const pathComponents = this.props.config.contentPath.split('.');
      while(pathComponents.length) {
        source = source[pathComponents.shift()];
      }
    }
    this.setState({ content: util.json2html(source) });
    this.runFilter(this.state.filterRules);
  }

  render() {
    if (!this.state.isLoggedIn) {
      return (
        <Provider>
          <div className="login-form">
            <Panel>
              <PanelHeader>
                Login to GitHub
              </PanelHeader>
              {this.state.loginError && (<Box p={3}>
                <Text color='red'>{this.state.loginError}</Text>
              </Box>)}
              <Box p={3}>
                <form onSubmit={this.login}>
                <Input
                  placeholder="username"
                  value={this.state.username}
                  onChange={(e) => this.handleChange(e, 'username')}/>
                <Input
                  placeholder="password"
                  type="password"
                  value={this.state.password}
                  onChange={(e) => this.handleChange(e, 'password')}/>
                  <Button
                    children='Login'
                  />
                </form>
              </Box>
            </Panel>
          </div>
        </Provider>
      );
    } else {
      return (
        <Provider>
          <div className="container">
            <div id="viewer" style={{display: this.state.showEditor ? 'none' : 'block'}}>
              <Filters
                addFilterRule={this.addFilterRule}
                editFilterRule={this.editFilterRule}
                removeFilterRule={this.removeFilterRule}
                filterRules={this.state.filterRules}
                schema={this.props.config.schema} />
              <hr />
              <div style={{textAlign: 'right'}}>
                <Button onClick={this.openEditor}>
                  Edit this page
                </Button>
              </div>
              <div
                id="target"
                className="markdown-body"
                dangerouslySetInnerHTML={{__html: this.state.content}} />
            </div>

            <Editor
              commitChanges={this.commitChanges}
              sourceCode={this.state.fileSource}
              show={this.state.showEditor} />
          </div>
        </Provider>
      );
    }
  }
}

export default App;
