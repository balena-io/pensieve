import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import _ from 'lodash';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Flex, Input, Text, Textarea, Box } from 'rebass';
import DocFragmentField from './doc-fragment-field';
import DocFragmentInput from './doc-fragment-input';
import { UnstyledList, ResinBtn, Modal, Container, FieldLabel, GreyDivider } from '../shared';
import * as DocumentService from '../../services/document';
import * as GitHubService from '../../services/github';
import { lint, schemaValidate } from '../../services/validator';
import { PensieveLinterError, PensieveValidationError } from '../../services/errors';
import { actions } from '../../actions';

const DocFragmentWrapper = styled.li`
  position: relative;
  padding-bottom: 60px;
`;

const InputListItem = styled.li`
  position: relative;
  margin-bottom: 28px;
`;

const DocFragmentEditWrapper = styled(DocFragmentWrapper)`
  background-color: #f6f6f6;
  border-bottom: 2px solid #cccccc;
  margin-bottom: -10px;
`;

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`;

class DocFragment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      edit: {
        title: this.props.title,
        content: _.cloneDeep(this.props.content),
      },
      newFieldTitle: '',
      showEditor: false,
      lintError: null,
      validationError: null,
      message: '',
      deleteMessage: '',
    };

    this.saveChange = this.saveChange.bind(this);
  }

  cancelEdit() {
    this.setState({
      showEditor: false,
      edit: {
        title: this.props.title,
        content: _.cloneDeep(this.props.content),
      },
    });
  }

  removeField(title) {
    const edit = this.state.edit;
    delete edit.content[title];
    this.setState({ edit });
  }

  handleTitleEdit(val) {
    const edit = this.state.edit;
    edit.title = val;
    this.setState({ edit });
  }

  handleFieldEdit(title, val) {
    const edit = this.state.edit;
    edit.content[title] = val;
    this.setState({ edit });
  }

  handleNewFieldTitleEdit(e) {
    const val = e.target.value;
    this.setState({ newFieldTitle: val });
  }

  updateCommitMessage(e) {
    const message = e.target.value;
    this.setState({ message });
  }

  updateDeleteCommitMessage(e) {
    const deleteMessage = e.target.value;
    this.setState({ deleteMessage });
  }

  addNewField(e) {
    e.preventDefault();
    const edit = this.state.edit;
    edit.content[this.state.newFieldTitle] = '';
    this.setState({
      edit,
      newFieldTitle: '',
    });
  }

  saveChange() {
    const source = this.state.edit.content;
    const title = this.state.edit.title;
    const message = this.state.message;
    if (!message) {
      return;
    }
    const { schema } = this.props;

    lint(source)
      .then(() => schemaValidate(schema, source))
      .then(() => {
        DocumentService.updateFragment(this.props.content.getHash(), title, source);

        this.setState({
          loading: true,
          showSaveModal: false,
          validationError: null,
        });
        GitHubService.commit({
          content: DocumentService.getSource(),
          message,
        }).then(() => {
          this.props.setContent(DocumentService.getJSON());
          this.setState({
            loading: false,
            showEditor: false,
          });
        });
      })
      .catch(PensieveLinterError, (err) => {
        this.setState({ lintError: err.message });
      })
      .catch(PensieveValidationError, (err) => {
        this.setState({ validationError: err.message });
      });
  }

  deleteEntry() {
    const message = this.state.deleteMessage;
    if (!message) {
      return;
    }

    DocumentService.deleteFragment(this.props.content.getHash());

    this.setState({
      loading: true,
      showDeleteModal: false,
      validationError: null,
    });

    GitHubService.commit({
      content: DocumentService.getSource(),
      message,
    }).finally(() =>
      this.setState({
        loading: false,
      }),
    );
  }

  render() {
    if (this.state.showEditor) {
      return (
        <DocFragmentEditWrapper>
          <GreyDivider />
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

            {this.state.loading
              ? <FontAwesome style={{ float: 'right' }} spin name="cog" />
              : <Flex align="right" justify="flex-end" style={{ marginBottom: 30 }}>
                <ResinBtn style={{ marginRight: 10 }} onClick={() => this.cancelEdit()}>
                    Cancel
                </ResinBtn>
                <ResinBtn
                  secondary
                  disabled={this.state.lintError}
                  onClick={() => this.setState({ showSaveModal: true })}
                >
                  <FontAwesome name="check" style={{ marginRight: 10 }} />
                    Save Changes
                </ResinBtn>
              </Flex>}

            {this.state.lintError &&
              <Text color="red">
                {this.state.lintError}
              </Text>}
            {this.state.validationError &&
              <Text color="red">
                {this.state.validationError}
              </Text>}

            <UnstyledList>
              <InputListItem>
                <DocFragmentInput
                  data={this.state.edit.title}
                  title="Entry title"
                  change={val => this.handleTitleEdit(val)}
                />
              </InputListItem>

              {_.map(this.state.edit.content, (data, title) =>
                (<InputListItem>
                  <DocFragmentInput
                    data={data}
                    title={title}
                    schema={this.props.schema[title]}
                    change={val => this.handleFieldEdit(title, val)}
                    remove={() => this.removeField(title)}
                  />
                </InputListItem>),
              )}
            </UnstyledList>

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
        </DocFragmentEditWrapper>
      );
    }

    return (
      <DocFragmentWrapper>
        <Container>
          <GreyDivider />

          {this.state.showDeleteModal &&
            <Modal
              title="Delete an entry"
              cancel={() => this.setState({ showDeleteModal: false })}
              done={() => this.deleteEntry()}
              action="Delete entry"
            >
              <Textarea
                rows={4}
                onChange={e => this.updateDeleteCommitMessage(e)}
                placeholder="Please describe your changes"
              />
            </Modal>}

          {this.state.loading
            ? <FontAwesome style={{ float: 'right' }} spin name="cog" />
            : <Flex align="right" justify="flex-end" style={{ marginBottom: 30 }}>
              <ResinBtn
                style={{ marginRight: 10 }}
                onClick={() => this.setState({ showEditor: true })}
              >
                <FontAwesome name="pencil" style={{ marginRight: 10 }} />
                  Edit Entry
              </ResinBtn>

              <ResinBtn onClick={() => this.setState({ showDeleteModal: true })}>
                <Text color="red">
                  <FontAwesome name="trash" style={{ marginRight: 10 }} />
                    Delete Entry
                </Text>
              </ResinBtn>
            </Flex>}
          <h2>
            {this.props.title}
          </h2>
          <UnstyledList>
            {_.map(
              this.props.content,
              (data, title) =>
                (_.isFunction(data)
                  ? null
                  : <li>
                    <h3>
                      {title}
                    </h3>
                    <DocFragmentField
                      key={title}
                      data={data}
                      title={title}
                      schema={this.props.schema[title]}
                    />
                  </li>),
            )}
          </UnstyledList>
        </Container>
      </DocFragmentWrapper>
    );
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  setContent: value => dispatch(actions.setContent(value)),
});

export default connect(mapStatetoProps, mapDispatchToProps)(DocFragment);
