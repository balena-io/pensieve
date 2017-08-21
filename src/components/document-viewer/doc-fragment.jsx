import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import { Button, Text, Textarea, Divider } from 'rebass';
import { UnstyledList, ResinBtn } from '../shared';
import * as DocumentService from '../../services/document';
import * as GitHubService from '../../services/github';
import { lint, schemaValidate } from '../../services/validator';
import { PensieveLinterError, PensieveValidationError } from '../../services/errors';
import store from '../../store';

const jsyaml = require('js-yaml');

const _ = require('lodash');
const showdown = require('showdown');

const converter = new showdown.Converter();

const makeNameClass = name => (name ? ` ${name.replace(/\s+/g, '_').toLowerCase()}` : '');

const cleanJson = (title, content) => {
  const json = {};
  json[title] = _.pickBy(
    _.mapValues(content, x => (_.isDate(x) ? x.toString() : x)),
    _.negate(_.isFunction),
  );

  return json;
};

const DocFragmentWrapper = styled.li`
  position: relative;
  padding-bottom: 60px;
`;

class DocFragment extends Component {
  constructor(props) {
    super(props);

    const json = cleanJson(this.props.title, this.props.content);
    const sourceCode = jsyaml.safeDump(json);

    this.state = {
      showEditor: false,
      lintError: null,
      validationError: null,
      sourceCode,
      message: '',
    };

    this.saveChange = this.saveChange.bind(this);
  }

  cancelEdit() {
    const json = cleanJson(this.props.title, this.props.content);
    const sourceCode = jsyaml.safeDump(json);

    this.setState({
      showEditor: false,
      sourceCode,
    });
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

  updateCommitMessage(e) {
    const message = e.target.value;
    this.setState({ message });
  }

  saveChange() {
    const source = this.refs.ace.editor.getValue();
    const message = `Edited section "${this.props.title}" using Pensieve\n\n${this.state.message}`;
    const { schema } = store.getState();

    lint(source)
      // When validating, strip the title field from the source
      .then(() => schemaValidate(schema, source.replace(/^.+\n/, '')))
      .then(() => {
        DocumentService.updateFragment(this.props.content.getHash(), source);

        this.setState({
          loading: true,
          validationError: null,
        });
        GitHubService.commit({
          content: DocumentService.getSource(),
          message,
        }).then(() =>
          this.setState({
            loading: false,
            showEditor: false,
          }),
        );
      })
      .catch(PensieveLinterError, (err) => {
        this.setState({ lintError: err.message });
      })
      .catch(PensieveValidationError, (err) => {
        this.setState({ validationError: err.message });
      });
  }

  render() {
    const fields = _.map(this.props.content, (data, title) => {
      const nameClass = makeNameClass(title);
      if (_.isFunction(data)) {
        return null;
      }
      if (_.isNumber(data)) {
        return (
          <li>
            <h3>
              {title}
            </h3>
            <span className={`_number${nameClass}`}>
              {data}
            </span>
          </li>
        );
      } else if (_.isString(data)) {
        return (
          <li>
            <h3>
              {title}
            </h3>
            <span
              className={`_string${nameClass} markdown-body`}
              dangerouslySetInnerHTML={{ __html: converter.makeHtml(data) }}
            />
          </li>
        );
      } else if (_.isBoolean(data)) {
        return (
          <li>
            <h3>
              {title}
            </h3>
            <span className={`_boolean${nameClass}`}>
              {data ? 'true' : 'false'}
            </span>
          </li>
        );
      } else if (_.isNull(data)) {
        return (
          <li>
            <h3>
              {title}
            </h3>
            <span className={`_null${nameClass}`}>
              {data}
            </span>
          </li>
        );
      } else if (_.isDate(data)) {
        return (
          <li>
            <h3>
              {title}
            </h3>
            <span className={`_date${nameClass}`}>
              {data.toString()}
            </span>
          </li>
        );
      }
      return (
        <li>
          <h3>
            {title}
          </h3>
          <span className={`${nameClass}`}>
            {data}
          </span>
        </li>
      );
    });

    if (this.state.showEditor) {
      return (
        <DocFragmentWrapper>
          <Divider style={{ borderBottomWidth: 2, marginBottom: 25 }} color="#cccccc" />

          <AceEditor
            mode="yaml"
            theme="chrome"
            name="code"
            width="100%"
            ref="ace"
            fontSize={14}
            tabSize={2}
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
              <Button bg="red" onClick={() => this.cancelEdit()}>
                  Cancel
              </Button>
            </div>}
        </DocFragmentWrapper>
      );
    }

    return (
      <DocFragmentWrapper>
        <Divider style={{ borderBottomWidth: 2, marginBottom: 30 }} color="#cccccc" />

        <ResinBtn style={{ float: 'right' }} onClick={() => this.setState({ showEditor: true })}>
          <FontAwesome name="pencil" style={{ marginRight: 10 }} />
          Edit Entry
        </ResinBtn>
        <h2>
          {this.props.title}
        </h2>
        <UnstyledList>
          {fields}
        </UnstyledList>
      </DocFragmentWrapper>
    );
  }
}

DocFragment.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
};

export default DocFragment;
