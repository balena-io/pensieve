import React, { Component } from 'react';
import Filters from './Filters';
import Doc from './Doc';

const createHistory = require('history').createBrowserHistory;

const history = createHistory();
const qs = require('qs');

const updateUrl = (rules) => {
  // Update url query string
  const { pathname } = history.location;
  history.push({
    pathname,
    search: qs.stringify(
      rules.map(({ name, operator, value }) => ({
        n: name,
        o: operator,
        v: value,
      })),
    ),
  });
};

class DocumentViewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterRules: [],
    };

    this.addFilterRule = this.addFilterRule.bind(this);
    this.removeFilterRule = this.removeFilterRule.bind(this);
    this.editFilterRule = this.editFilterRule.bind(this);
  }

  addFilterRule(rule) {
    const rules = this.state.filterRules;
    rules.push(rule);
    this.setState({ filterRules: rules });

    updateUrl(rules);
  }

  editFilterRule(rule) {
    const rules = this.state.filterRules.map(r => (r.hash === rule ? rule : r));

    this.setState({ filterRules: rules });

    updateUrl(rules);
  }

  removeFilterRule(rule) {
    const rules = this.state.filterRules.filter(r => r.hash !== rule.hash);
    this.setState({ filterRules: rules });

    updateUrl(rules);
  }

  render() {
    return (
      <div className="container">
        <div id="viewer">
          <Filters
            addFilterRule={this.addFilterRule}
            editFilterRule={this.editFilterRule}
            removeFilterRule={this.removeFilterRule}
            filterRules={this.state.filterRules}
            schema={this.props.config.schema}
          />
          <hr />
          <Doc content={this.props.content} rules={this.state.filterRules} />
        </div>
      </div>
    );
  }
}

export default DocumentViewer;
