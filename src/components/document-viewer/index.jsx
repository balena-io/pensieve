import React, { Component } from 'react';
import _ from 'lodash';
import { Flex, Box } from 'rebass';
import styled from 'styled-components';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { actions } from '../../actions';
import Filters from '../filters';
import Doc from './doc';
import DocFragmentCreator from './doc-fragment-creator';
import SchemaEditor from '../schema-editor';
import { Container, ResinBtn } from '../shared';
import { colors } from '../../theme';

const SkeleBtn = styled(ResinBtn)`
  color: ${colors.blue};
  border: 0;
  > span {
    border-bottom: 1px solid;
    padding-bottom: 3px;
  }
`;

class DocumentViewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterRules: [],
    };
  }

  editSchema() {
    this.props.setIsEditingSchema(true);
  }

  render() {
    const schemaIsEditable = _.isString(this.props.config.schema);

    return (
      <Box mt={40}>
        <Container>
          <Filters schema={this.props.schema} />
          <Flex align="right" justify="flex-end" style={{ marginBottom: 30 }}>
            {schemaIsEditable &&
              <SkeleBtn style={{ marginRight: 10 }} onClick={() => this.editSchema()}>
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
        </Container>
        {this.props.isEditingSchema && <SchemaEditor />}
        {this.state.showNewEntryForm &&
          <DocFragmentCreator
            schema={this.props.schema}
            close={() => this.setState({ showNewEntryForm: false })}
          />}

        <Doc />
      </Box>
    );
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content,
  config: state.config,
  isEditingSchema: state.isEditingSchema,
});

const mapDispatchToProps = dispatch => ({
  setIsEditingSchema: value => dispatch(actions.setIsEditingSchema(value)),
});

export default connect(mapStatetoProps, mapDispatchToProps)(DocumentViewer);
