import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import { Button } from 'rebass';
import * as DocumentService from '../../services/document';
import * as GitHubService from '../../services/github';

const jsyaml = require('js-yaml');

const _ = require('lodash');

class DocFragmentCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showEditor: false,
    };

    this.saveChange = this.saveChange.bind(this);
  }

  saveChange() {
    const source = this.refs.ace.editor.getValue();
    DocumentService.addFragment(source);

    this.setState({
      loading: true,
    });
    GitHubService.commit({ content: DocumentService.getSource() }).then(() => {
      this.setState({
        loading: false,
      });
      this.props.close();
    });
  }

  render() {
    const json = {};
    _.forEach(this.props.schema, (value, key) => {
      const defaultFieldValue = `// ${value.type} value`;
      json[key] = defaultFieldValue;
    });
    const entryName = `New Entry - ${new Date().toString()}`;
    const entry = {};
    entry[entryName] = json;
    const sourceCode = jsyaml.safeDump(entry);
    console.log(sourceCode);
    return (
      <div>
        {this.state.loading
          ? <FontAwesome spin name="cog" />
          : <Button onClick={this.saveChange}>Save</Button>}

        <AceEditor
          mode="yaml"
          theme="chrome"
          name="code"
          width="100%"
          ref="ace"
          fontSize={14}
          onChange={this.onChange}
          value={sourceCode}
          onLoad={(editor) => {
            editor.focus();
            editor.getSession().setUseWrapMode(true);
          }}
        />
      </div>
    );
  }
}

export default DocFragmentCreator;
