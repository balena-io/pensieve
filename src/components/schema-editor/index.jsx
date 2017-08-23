import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { Text, Textarea, Button } from 'rebass';
import jsyaml from 'js-yaml';
import 'brace';
import AceEditor from 'react-ace';
import { connect } from 'react-redux';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import store from '../../store';
import * as GitHubService from '../../services/github';
import { lint } from '../../services/validator';
import { PensieveLinterError } from '../../services/errors';
import Container from '../shared/container';

const done = () => {
  store.dispatch({ type: 'SET_IS_EDITING_SCHEMA', value: false });
};

class SchemaEditor extends Component {
  constructor(props) {
    super(props);

    const sourceCode = jsyaml.safeDump(this.props.schema);

    this.state = {
      loading: false,
      message: '',
      sourceCode,
    };
  }

  onChange() {
    const sourceCode = this.refs.ace.editor.getValue();
    this.setState({ sourceCode });
    lint(sourceCode)
      .then(() => {
        this.setState({ lintError: null });
      })
      .catch((err) => {
        this.setState({ lintError: err.message });
      });
  }

  save() {
    const source = this.refs.ace.editor.getValue();
    lint(source)
      .then(() => {
        this.setState({
          loading: true,
          lintError: null,
        });
        GitHubService.commitSchema({ content: source, message: this.state.message }).then(() => {
          store.dispatch({ type: 'SET_SCHEMA', value: jsyaml.load(source) });
          done();
          this.setState({
            loading: false,
          });
        });
      })
      .catch(PensieveLinterError, (err) => {
        this.setState({ lintError: err.message });
      });
  }

  updateCommitMessage(e) {
    const message = e.target.value;
    this.setState({ message });
  }

  render() {
    if (this.state.loading) {
      return <FontAwesome spin name="cog" />;
    }
    return (
      <Container>
        <AceEditor
          mode="yaml"
          theme="chrome"
          name="code"
          width="100%"
          ref="ace"
          fontSize={14}
          tabSize={2}
          onChange={() => this.onChange()}
          value={this.state.sourceCode}
          onLoad={(editor) => {
            editor.focus();
            editor.getSession().setUseWrapMode(true);
          }}
        />
        {this.state.lintError &&
          <Text color="red">
            {this.state.lintError}
          </Text>}
        <Textarea
          onChange={e => this.updateCommitMessage(e)}
          placeholder="Please describe your changes"
        />
        <Button onClick={() => this.save()}>Save changes</Button>
        <Button bg="red" onClick={done}>
          Cancel
        </Button>
      </Container>
    );
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content,
});

export default connect(mapStatetoProps)(SchemaEditor);
