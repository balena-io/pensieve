import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import { Button } from 'rebass';
import UnstyledList from './UnstyledList';
import * as DocumentService from '../../services/document';
import * as GitHubService from '../../services/github';

const jsyaml = require('js-yaml');

const _ = require('lodash');
const showdown = require('showdown');

const converter = new showdown.Converter();

const makeNameClass = name => (name ? ` ${name.replace(/\s+/g, '_').toLowerCase()}` : '');

class DocFragment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showEditor: false,
    };

    this.saveChange = this.saveChange.bind(this);
  }

  saveChange() {
    const source = this.refs.ace.editor.getValue();
    DocumentService.updateFragment(this.props.content.getHash(), source);

    this.setState({
      loading: true,
    });
    GitHubService.commit({ content: DocumentService.getSource() }).then(() =>
      this.setState({
        loading: false,
        showEditor: false,
      }),
    );
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
              className={`_string${nameClass}`}
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
      const json = {};
      json[this.props.title] = _.pickBy(
        _.mapValues(this.props.content, x => (_.isDate(x) ? x.toString() : x)),
        _.negate(_.isFunction),
      );
      const sourceCode = jsyaml.safeDump(json);
      console.log(sourceCode);
      return (
        <li className="document-fragment">
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
            tabSize={2}
            onChange={this.onChange}
            value={sourceCode}
            onLoad={(editor) => {
              editor.focus();
              editor.getSession().setUseWrapMode(true);
            }}
          />
        </li>
      );
    }

    return (
      <li className="document-fragment">
        <h2>
          {this.props.title}
          <FontAwesome onClick={() => this.setState({ showEditor: true })} name="pencil" />
        </h2>
        <UnstyledList>
          {fields}
        </UnstyledList>
      </li>
    );
  }
}

export default DocFragment;
