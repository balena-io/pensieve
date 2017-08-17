import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import { Button, Textarea, Text } from 'rebass';
import * as DocumentService from '../../services/document';
import * as GitHubService from '../../services/github';
import { lint, schemaValidate } from '../../services/validator';
import { PensieveLinterError, PensieveValidationError } from '../../services/errors';

const jsyaml = require('js-yaml');

const _ = require('lodash');

class DocFragmentCreator extends Component {
  constructor(props) {
    super(props);

    const json = {};
    _.forEach(this.props.schema, (value, key) => {
      const defaultFieldValue = `// ${value.type} value`;
      json[key] = defaultFieldValue;
    });
    const entryName = `New Entry - ${new Date().toString()}`;
    const entry = {};
    entry[entryName] = json;
    const sourceCode = jsyaml.safeDump(entry);

    this.state = {
      showEditor: false,
      lintError: null,
      validationError: null,
      message: '',
      sourceCode,
    };

    this.saveChange = this.saveChange.bind(this);
  }

  handleChange() {
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

  saveChange() {
    const source = this.refs.ace.editor.getValue();
    const message = `Added section using Pensieve\n\n${this.state.message}`;

    lint(source)
      // When validating, strip the title field from the source
      .then(() => schemaValidate(this.props.schema, source.replace(/^.+\n/, '')))
      .then(() => {
        DocumentService.addFragment(source);
        this.setState({
          loading: true,
          validationError: null,
        });
        GitHubService.commit({ content: DocumentService.getSource(), message }).then(() => {
          this.setState({
            loading: false,
          });
          this.props.close();
        });
      })
      .catch(PensieveLinterError, (err) => {
        this.setState({ lintError: err.message });
      })
      .catch(PensieveValidationError, (err) => {
        this.setState({ validationError: err.message });
      });
  }

  render() {
    return (
      <div>
        <AceEditor
          mode="yaml"
          theme="chrome"
          name="code"
          width="100%"
          ref="ace"
          fontSize={14}
          onChange={() => this.handleChange()}
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
        {this.state.validationError &&
          <Text color="red">
            {this.state.validationError}
          </Text>}
        {this.state.loading
          ? <FontAwesome spin name="cog" />
          : <div>
            <Textarea
              onChange={e => this.updateCommitMessage(e)}
              placeholder="Please describe your changes"
            />
            <Button onClick={this.saveChange} disabled={this.state.lintError}>
                Save
            </Button>
            <Button bg="red" onClick={() => this.props.close()}>
                Cancel
            </Button>
          </div>}
      </div>
    );
  }
}

export default DocFragmentCreator;
