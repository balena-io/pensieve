import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import _ from 'lodash';
import styled from 'styled-components';
import { Box, Input, Textarea, Text, Flex } from 'rebass';
import { Container, Modal, ResinBtn, UnstyledList, FieldLabel, GreyDivider } from '../shared';
import * as DocumentService from '../../services/document';
import * as GitHubService from '../../services/github';
import { lint, schemaValidate } from '../../services/validator';
import { PensieveLinterError, PensieveValidationError } from '../../services/errors';
import DocFragmentInput from './doc-fragment-input';

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`;

const InputListItem = styled.li`
  position: relative;
  margin-bottom: 28px;
`;

const Wrapper = styled.div`
  background-color: #f6f6f6;
  border-bottom: 2px solid #cccccc;
  margin-bottom: -10px;
  padding-bottom: 60px;
`;

class DocFragmentCreator extends Component {
  constructor(props) {
    super(props);

    const json = {};
    _.forEach(this.props.schema, (value, key) => {
      const defaultFieldValue = `// ${value.type} value`;
      json[key] = defaultFieldValue;
    });
    const entryName = `New Entry - ${new Date().toString()}`;
    const entry = {};
    entry[entryName] = json;

    const content = _.mapValues(this.props.schema, () => '');

    this.state = {
      showEditor: false,
      lintError: null,
      validationError: null,
      message: '',
      title: '',
      content,
      newFieldTitle: '',
    };

    this.saveChange = this.saveChange.bind(this);
  }

  updateCommitMessage(e) {
    const message = e.target.value;
    this.setState({ message });
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

  saveChange() {
    const source = _.pickBy(this.state.content, val => val !== '');
    const title = this.state.title;
    const message = this.state.message;
    if (!message) {
      return;
    }

    lint(source)
      // When validating, strip the title field from the source
      .then(() => schemaValidate(this.props.schema, source))
      .then(() => {
        DocumentService.addFragment(title, source);

        this.setState({
          loading: true,
          showSaveModal: false,
          validationError: null,
        });

        GitHubService.commit({ content: DocumentService.getSource(), message }).then(() => {
          this.setState({
            loading: false,
          });
          this.props.close();
        });
      })
      .catch(PensieveLinterError, (err) => {
        this.setState({ lintError: err.message });
      })
      .catch(PensieveValidationError, (err) => {
        this.setState({ validationError: err.message });
      });
  }

  removeField(title) {
    const content = this.state.content;
    delete content[title];
    this.setState({ content });
  }

  handleFieldEdit(title, val) {
    const content = this.state.content;
    content[title] = val;
    this.setState({ content });
  }

  handleTitleEdit(title) {
    this.setState({ title });
  }

  handleNewFieldTitleEdit(e) {
    const val = e.target.value;
    this.setState({ newFieldTitle: val });
  }

  addNewField(e) {
    e.preventDefault();
    const content = this.state.content;
    content[this.state.newFieldTitle] = '';
    this.setState({
      content,
      newFieldTitle: '',
    });
  }

  render() {
    return (
      <Wrapper>
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
              <ResinBtn style={{ marginRight: 10 }} onClick={() => this.props.close()}>
                <FontAwesome name="tick" style={{ marginRight: 10 }} />
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
                data={this.state.title}
                title="Entry title"
                change={val => this.handleTitleEdit(val)}
              />
            </InputListItem>

            {_.map(this.state.content, (data, title) =>
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
      </Wrapper>
    );
  }
}

export default DocFragmentCreator;
