import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { Divider, Flex, Box, Input, Select, Textarea } from 'rebass';
import styled from 'styled-components';
import _ from 'lodash';
import jsyaml from 'js-yaml';
import { connect } from 'react-redux';
import store from '../../store';
import * as GitHubService from '../../services/github';
import { ResinBtn, DeleteBtn, Modal, FieldLabel } from '../shared';
import Container from '../shared/container';
import SchemeSieve from '../../services/filter';

const sieve = SchemeSieve();

const ShortSelect = styled(Select)`
  max-width: 300px;
  background-color: white;
`;

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`;

const TypeSelect = ({ ...props }) =>
  (<ShortSelect {...props}>
    {_.map(sieve.getTypes(), type =>
      (<option key={type}>
        {type}
      </option>),
    )}
  </ShortSelect>);

const StyledDeleteBtn = styled(DeleteBtn)`
  position: absolute;
  right: -35px;
  top: 2px;

  &:hover + ${Flex}:after {
    content: '';
    content: '';
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
    position: absolute;
    left: -5px;
    right: -5px;
    top: -5px;
    bottom: -5px;
  }
`;

const done = () => {
  store.dispatch({ type: 'SET_IS_EDITING_SCHEMA', value: false });
};

const Wrapper = styled.div`
  background-color: #f3f3f3;
  border-bottom: 2px solid #cccccc;
  margin-bottom: -10px;
  padding-bottom: 60px;
`;

class SchemaEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      message: '',
      edit: _.cloneDeep(this.props.schema),
      newFieldTitle: '',
    };
  }

  handleFieldEdit(title, e) {
    const val = e.target.value;
    const edit = this.state.edit;
    edit[title].type = val;
    this.setState({ edit });
  }

  handleNewFieldTitleEdit(e) {
    const val = e.target.value;
    this.setState({ newFieldTitle: val });
  }

  saveChange() {
    const source = jsyaml.safeDump(this.state.edit);
    this.setState({
      loading: true,
      showSaveModal: false,
      lintError: null,
    });
    GitHubService.commitSchema({ content: source, message: this.state.message }).then(() => {
      store.dispatch({ type: 'SET_SCHEMA', value: jsyaml.load(source) });
      done();
      this.setState({
        loading: false,
      });
    });
  }

  addNewField(e) {
    e.preventDefault();
    const edit = this.state.edit;
    edit[this.state.newFieldTitle] = { type: sieve.getTypes()[0] };
    this.setState({
      edit,
      newFieldTitle: '',
    });
  }

  remove(title) {
    const edit = this.state.edit;
    delete edit[title];
    this.setState({ edit });
  }

  updateCommitMessage(e) {
    const message = e.target.value;
    this.setState({ message });
  }

  render() {
    const fields = _.map(this.state.edit, (value, title) =>
      (<Box mb={28} style={{ position: 'relative' }} key={title}>
        <StyledDeleteBtn onClick={() => this.remove(title)} />
        <Flex>
          <Box width={250}>
            <FieldLabel>
              {title}
            </FieldLabel>
          </Box>
          <Box flex={1}>
            <TypeSelect value={value.type} onChange={e => this.handleFieldEdit(title, e)} />
          </Box>
        </Flex>
      </Box>),
    );

    return (
      <Wrapper>
        <Divider style={{ borderBottomWidth: 2, marginBottom: 25 }} color="#cccccc" />
        <Container>
          {this.state.showSaveModal &&
            <Modal
              title="Describe your changes"
              cancel={() => this.setState({ showSaveModal: false })}
              done={() => this.saveChange()}
              action="Save changes"
            >
              <Textarea
                rows={4}
                onChange={e => this.updateCommitMessage(e)}
                placeholder="Please describe your changes"
              />
            </Modal>}

          <Flex justify="space-between">
            <h2 style={{ marginTop: 0 }}>Edit Schema</h2>
            {this.state.loading
              ? <Box>
                <FontAwesome spin name="cog" />
              </Box>
              : <Flex align="right" justify="flex-end" style={{ marginBottom: 30 }}>
                <ResinBtn style={{ marginRight: 10 }} onClick={done}>
                    Cancel
                </ResinBtn>
                <ResinBtn
                  color="orange"
                  disabled={this.state.lintError}
                  onClick={() => this.setState({ showSaveModal: true })}
                >
                  <FontAwesome name="check" style={{ marginRight: 10 }} />
                    Save Changes
                </ResinBtn>
              </Flex>}
          </Flex>

          {fields}

          <Box mt={90}>
            <form onSubmit={e => this.addNewField(e)}>
              <Flex>
                <Box width={250}>
                  <FieldLabel>Add a new field</FieldLabel>
                </Box>
                <Box flex={1}>
                  <ShortInput
                    mr={10}
                    value={this.state.newFieldTitle}
                    onChange={e => this.handleNewFieldTitleEdit(e)}
                    placeholder="Enter the field title"
                  />
                </Box>
                <ResinBtn onClick={e => this.addNewField(e)}>
                  <FontAwesome name="plus" style={{ marginRight: 10 }} />
                  Add field
                </ResinBtn>
              </Flex>
            </form>
          </Box>
        </Container>
      </Wrapper>
    );
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content,
});

export default connect(mapStatetoProps)(SchemaEditor);
