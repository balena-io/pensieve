import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Flex } from 'rebass';
import styled from 'styled-components';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import store from '../../store';
import Filters from '../filters';
import Doc from './doc';
import DocFragmentCreator from './doc-fragment-creator';
import Container from '../shared/container';
import ResinBtn from '../shared/resin-button';
import { colors } from '../../theme';

const SkeleBtn = styled(ResinBtn)`
  color: ${colors.blue};
  border: 0;
  > span {
    border-bottom: 1px solid;
    padding-bottom: 3px;
  }
`;

const editSchema = () => {
  store.dispatch({ type: 'SET_IS_EDITING_SCHEMA', value: true });
};

class DocumentViewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterRules: [],
    };
  }

  render() {
    const schemaIsEditable = _.isString(this.props.config.schema);

    if (this.state.showNewEntryForm) {
      return (
        <Container>
          <DocFragmentCreator
            schema={this.props.schema}
            close={() => this.setState({ showNewEntryForm: false })}
          />
        </Container>
      );
    }
    return (
      <Container>
        <div id="viewer">
          <Filters schema={this.props.schema} />
          <Flex align="right" justify="flex-end" style={{ marginBottom: 30 }}>
            {schemaIsEditable &&
              <SkeleBtn style={{ marginRight: 10 }} onClick={editSchema}>
                <span>
                  <FontAwesome name="list-alt" style={{ marginRight: 10 }} />
                  Edit schema
                </span>
              </SkeleBtn>}
            <ResinBtn onClick={() => this.setState({ showNewEntryForm: true })}>
              <FontAwesome name="plus" style={{ marginRight: 10 }} />
              Add entry
            </ResinBtn>
          </Flex>

          <Doc />
        </div>
      </Container>
    );
  }
}

DocumentViewer.propTypes = {
  schema: PropTypes.object.isRequired,
};

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content,
  config: state.config,
});

export default connect(mapStatetoProps)(DocumentViewer);
