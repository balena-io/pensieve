import React, { Component } from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import {
  Button,
  Input,
  Textarea,
} from 'rebass';

class Editor extends Component {

  constructor(props) {
    super(props);

    this.state = {
      header: '',
      body: '',
      sourceCode: this.props.sourceCode,
    }

    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.commitChanges = this.commitChanges.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      sourceCode: nextProps.sourceCode,
    });
  }

  handleChange(e, attribute) {
    let update = {}
    update[attribute] = e.target.value;
    this.setState(update);
  }

  commitChanges() {
   const source = this.refs.ace.editor.getValue();

   let message = this.state.header;
   if (this.state.body) {
     message += `\n\n${this.state.body}`;
   }

   this.props.commitChanges({
     content: source,
     message,
   });

   this.setState({
     header: '',
     body: '',
   });
  }

  onChange(newValue) {
    this.setState({ sourceCode: newValue });
  }


  render() {
    return (
      <div id="editor" style={{display: this.props.show ? 'block': 'none'}}>
        <AceEditor
          mode="yaml"
          theme="chrome"
          name="code"
          width="100%"
          ref="ace"
          fontSize={14}
          onChange={this.onChange}
          value={this.state.sourceCode}
          onLoad={(editor) => {
            editor.focus();
            editor.getSession().setUseWrapMode(true);
          }}
        />
        <h2>Commit changes</h2>
        <Input
          style={{marginBottom: 3}}
          onChange={(e) => this.handleChange(e, 'header')}
          value={this.state.header}
          placeholder="Edited file using Pensieve" />
        <Textarea
          onChange={(e) => this.handleChange(e, 'body')}
          value={this.state.body}
          rows={4}
          placeholder="Add an optional extended description" />
        <Button onClick={this.commitChanges} children='commit changes' />
      </div>
    );
  }
}

export default Editor;
