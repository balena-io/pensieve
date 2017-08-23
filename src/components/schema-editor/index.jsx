import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { Divider, Flex, Box, Input, Select, Textarea } from 'rebass';
import styled from 'styled-components';
import Color from 'color';
import _ from 'lodash';
import jsyaml from 'js-yaml';
import { connect } from 'react-redux';
import store from '../../store';
import * as GitHubService from '../../services/github';
import { ResinBtn, DeleteBtn, Modal } from '../shared';
import Container from '../shared/container';
import { colors } from '../../theme';
import SchemeSieve from '../../services/filter';

const sieve = SchemeSieve();

const FieldHeader = styled.h3`margin-bottom: 5px;`;

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
      (<option>
        {type}
      </option>),
    )}
  </ShortSelect>);

const DeleteBtnStyle = {
  position: 'absolute',
  left: -30,
  bottom: 3,
};

const done = () => {
  store.dispatch({ type: 'SET_IS_EDITING_SCHEMA', value: false });
};

const Wrapper = styled.div`
  background-color: ${Color(colors.orange).fade(0.84).string()};
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
      (<Box style={{ position: 'relative' }}>
        <DeleteBtn style={DeleteBtnStyle} onClick={() => this.remove(title)} />
        <FieldHeader>
          {title}
        </FieldHeader>
        <TypeSelect value={value.type} onChange={e => this.handleFieldEdit(title, e)} />
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
            <h2>Edit Schema</h2>
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

          <Box mt={60}>
            <form onSubmit={e => this.addNewField(e)}>
              <h3>Add a new field</h3>
              <Flex>
                <ShortInput
                  mr={10}
                  value={this.state.newFieldTitle}
                  onChange={e => this.handleNewFieldTitleEdit(e)}
                  placeholder="Enter the field title"
                />
                <ResinBtn onClick={e => this.addNewField(e)}>Add field</ResinBtn>
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
