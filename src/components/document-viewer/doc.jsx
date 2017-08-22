import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DocFragment from './doc-fragment';
import { UnstyledList } from '../shared';

const SchemaSeive = require('../../services/filter');

const seive = SchemaSeive();

const canShowFrag = (fragment, rules) => {
  let source = _.cloneDeep(fragment);

  rules.forEach((rule) => {
    source = seive.filter(source, rule);
  });

  return Object.keys(source).length > 0;
};

class Doc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
    };
  }

  render() {
    const frags = _.map(this.props.content, (value, key) => {
      if (canShowFrag({ key: value }, this.props.rules)) {
        return <DocFragment title={key} content={value} schema={this.props.schema} />;
      }

      return null;
    });

    return (
      <UnstyledList>
        {frags}
      </UnstyledList>
    );
  }
}

Doc.propTypes = {
  content: PropTypes.object.isRequired,
  rules: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
};

const mapStatetoProps = ({ rules, content, schema }) => ({
  rules,
  content,
  schema,
});

export default connect(mapStatetoProps)(Doc);
