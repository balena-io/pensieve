import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import _ from 'lodash'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Flex, Input, Text, Textarea, Box } from 'rebass'
import DocFragmentField from './doc-fragment-field'
import DocFragmentInput from './doc-fragment-input'
import {
  UnstyledList,
  ResinBtn,
  Modal,
  Container,
  FieldLabel,
  GreyDivider
} from '../shared'
import Alert from '../alerts/alert'
import * as DocumentService from '../../services/document'
import * as GitHubService from '../../services/github'
import { lint, schemaValidate } from '../../services/validator'
import {
  PensieveLinterError,
  PensieveValidationError
} from '../../services/errors'
import * as NotificationService from '../../services/notifications'
import { actions } from '../../actions'
import { debug, makeAnchorLink } from '../../util'

const DocFragmentWrapper = styled.li`
  position: relative;
  padding-bottom: 60px;

  h2,
  h3 {
    .anchor {
      visibility: hidden;
      float: left;
      padding-right: 4px;
      margin-top: 2px;
      margin-left: -20px;
      line-height: 1;
      font-size: 16px;
      color: #333;
    }

    &:hover .anchor {
      visibility: visible;
      text-decoration: none;
    }
  }
`

const InputListItem = styled.li`
  position: relative;
  margin-bottom: 28px;
`

const DocFragmentEditWrapper = styled(DocFragmentWrapper)`
  background-color: #f6f6f6;
  border-bottom: 2px solid #cccccc;
  margin-bottom: -10px;
`

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`

const AnchorLink = ({ text }) => (
  <a
    className='anchor'
    href={'#' + makeAnchorLink(text)}
    id={makeAnchorLink(text)}
  >
    <FontAwesome name='link' />
  </a>
)

class DocFragment extends Component {
  constructor (props) {
    super(props)

    this.state = {
      edit: {
        title: this.props.title,
        content: _.cloneDeep(this.props.content)
      },
      newFieldTitle: '',
      showEditor: false,
      lintError: null,
      validationError: null,
      message: '',
      deleteMessage: '',
      loading: false
    }

    this.saveChange = this.saveChange.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.showEditor) {
      if (
        nextProps.title !== this.state.edit.title ||
        JSON.stringify(this.state.edit.content) !==
          JSON.stringify(nextProps.content)
      ) {
        this.setState({ editorConflict: true })
      }
    }
  }

  cancelEdit () {
    this.setState({
      showEditor: false,
      edit: {
        title: this.props.title,
        content: _.cloneDeep(this.props.content)
      }
    })
    this.props.setUserIsEditing(false)
  }

  removeField (title) {
    const edit = this.state.edit
    delete edit.content[title]
    this.setState({ edit })
  }

  handleTitleEdit (val) {
    const edit = this.state.edit
    edit.title = val
    this.setState({ edit })
  }

  handleFieldEdit (title, val) {
    const edit = this.state.edit
    edit.content[title] = val
    this.setState({ edit })
  }

  handleNewFieldTitleEdit (e) {
    const val = e.target.value
    this.setState({ newFieldTitle: val })
  }

  updateCommitMessage (e) {
    const message = e.target.value
    this.setState({ message })
  }

  updateDeleteCommitMessage (e) {
    const deleteMessage = e.target.value
    this.setState({ deleteMessage })
  }

  showEditor () {
    // Refresh the edit object in case the document has synced in the background
    this.setState({
      editorConflict: false,
      showEditor: true,
      edit: {
        title: this.props.title,
        content: _.cloneDeep(this.props.content)
      }
    })
    this.props.setUserIsEditing(true)
  }

  addNewField (e) {
    e.preventDefault()
    const edit = this.state.edit
    edit.content[this.state.newFieldTitle] = ''
    this.setState({
      edit,
      newFieldTitle: ''
    })
  }

  saveChange () {
    const source = this.state.edit.content
    const title = this.state.edit.title

    let message = `Edited entry "${this.props.title}"`

    const edits = []
    _.forEach(this.props.content, (value, key) => {
      if (value !== this.state.edit.content[key]) {
        edits.push(`"${key}"`)
      }
    })
    if (edits.length > 1) {
      message +=
        ', changing fields ' +
        edits.slice(0, edits.length - 1).join(', ') +
        ' and ' +
        edits.pop()
    } else if (edits.length === 1) {
      message += ', changing the field ' + edits[0]
    }

    const { schema } = this.props

    this.setState({
      loading: true
    })

    lint(source)
      .then(() => schemaValidate(schema, source))
      // Make a final check to see if the document commit has changed before saving
      // If the commit has changed, we just wait for the sync poll to cycle and let the user resolve the issue
      .then(() =>
        GitHubService.getDocumentCommit(
          this.props.config.repo
        ).then(({ sha }) => {
          if (this.props.documentCommit && this.props.documentCommit !== sha) {
            debug('New commit detected', sha)
            throw new Error(
              'The underlying document has changed since you began editing. Please ensure any conflicts are resolved before continuing'
            )
          }
        })
      )
      .then(() => {
        this.setState({
          validationError: null
        })

        return DocumentService.updateAndCommitFragment(
          this.props.content.getUuid(),
          title,
          source,
          message
        ).then(() => {
          this.setState({
            showEditor: false
          })
          this.props.setUserIsEditing(false)
        })
      })
      .catch(PensieveLinterError, err => {
        this.setState({ lintError: err.message })
      })
      .catch(PensieveValidationError, err => {
        this.setState({ validationError: err.message })
      })
      .catch(err => {
        NotificationService.error(err)
      })
      .finally(() => {
        this.setState({
          loading: false
        })
      })
  }

  deleteEntry () {
    const message = this.state.deleteMessage
    if (!message) {
      return
    }

    this.setState({
      loading: true,
      showDeleteModal: false,
      validationError: null
    })

    DocumentService.deleteFragment(this.props.content.getUuid())
      .catch(NotificationService.error)
      .finally(() => {
        this.setState({
          loading: false
        })
      })
  }

  fieldHasConflict (edit, source) {
    return this.state.editorConflict && edit !== source
  }

  render () {
    if (this.state.showEditor) {
      return (
        <DocFragmentEditWrapper>
          <GreyDivider />
          <Container>
            {this.state.loading ? (
              <Box style={{ height: 32 }} mb={30}>
                <FontAwesome style={{ float: 'right' }} spin name='cog' />
              </Box>
            ) : (
              <Flex align='right' justify='flex-end' mb={30}>
                <ResinBtn
                  style={{ marginRight: 10 }}
                  onClick={() => this.cancelEdit()}
                >
                  Cancel
                </ResinBtn>
                <ResinBtn
                  secondary
                  disabled={this.state.lintError}
                  onClick={() => this.saveChange()}
                >
                  <FontAwesome name='check' style={{ marginRight: 10 }} />
                  Save Changes
                </ResinBtn>
              </Flex>
            )}

            {this.state.lintError && (
              <Text color='red'>{this.state.lintError}</Text>
            )}
            {this.state.validationError && (
              <Text color='red'>{this.state.validationError}</Text>
            )}
            {this.state.editorConflict && (
              <Box mb={30}>
                <Alert type='info'>
                  The document has been updated by another user and the fragment
                  you are editing has changed. The new values are displayed
                  below.
                </Alert>
              </Box>
            )}

            <UnstyledList>
              <InputListItem>
                <DocFragmentInput
                  data={this.state.edit.title}
                  title='Entry title'
                  change={val => this.handleTitleEdit(val)}
                />
              </InputListItem>

              {_.map(this.state.edit.content, (data, title) => (
                <InputListItem key={title}>
                  <Flex>
                    <Box flex='1'>
                      <DocFragmentInput
                        data={data}
                        title={title}
                        schema={this.props.schema[title]}
                        change={val => this.handleFieldEdit(title, val)}
                        remove={() => this.removeField(title)}
                      />
                    </Box>
                    {this.fieldHasConflict(data, this.props.content[title]) && (
                      <Box flex='1'>
                        <DocFragmentInput
                          data={this.props.content[title]}
                          title={title}
                          schema={this.props.schema[title]}
                          change={_.noop}
                          diff
                        />
                      </Box>
                    )}
                  </Flex>
                </InputListItem>
              ))}
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
                      placeholder='Enter the field title'
                    />
                  </Box>
                  <ResinBtn onClick={e => this.addNewField(e)}>
                    <FontAwesome name='plus' style={{ marginRight: 10 }} />
                    Add field
                  </ResinBtn>
                </Flex>
              </form>
            </Box>
          </Container>
        </DocFragmentEditWrapper>
      )
    }

    return (
      <DocFragmentWrapper>
        <Container>
          <GreyDivider />

          {this.state.showDeleteModal && (
            <Modal
              title='Delete an entry'
              cancel={() => this.setState({ showDeleteModal: false })}
              done={() => this.deleteEntry()}
              action='Delete entry'
            >
              <Textarea
                rows={4}
                onChange={e => this.updateDeleteCommitMessage(e)}
                placeholder='Please describe your changes'
              />
            </Modal>
          )}

          {this.state.loading ? (
            <FontAwesome style={{ float: 'right' }} spin name='cog' />
          ) : (
            <Flex align='right' justify='flex-end' style={{ marginBottom: 30 }}>
              <ResinBtn
                style={{ marginRight: 10 }}
                onClick={() => this.showEditor()}
              >
                <FontAwesome name='pencil' style={{ marginRight: 10 }} />
                Edit Entry
              </ResinBtn>

              <ResinBtn
                onClick={() => this.setState({ showDeleteModal: true })}
              >
                <Text color='red'>
                  <FontAwesome name='trash' style={{ marginRight: 10 }} />
                  Delete Entry
                </Text>
              </ResinBtn>
            </Flex>
          )}
          <h2>
            <AnchorLink text={this.props.title} />
            {this.props.title}
          </h2>
          <UnstyledList>
            {_.map(
              this.props.content,
              (data, title) =>
                _.isFunction(data) ? null : (
                  <li key={title}>
                    <h3>
                      <AnchorLink text={this.props.title + '-' + title} />
                      {title}
                    </h3>
                    <DocFragmentField
                      data={data}
                      title={title}
                      schema={this.props.schema[title]}
                    />
                  </li>
                )
            )}
          </UnstyledList>
        </Container>
      </DocFragmentWrapper>
    )
  }
}

const mapStatetoProps = state => ({
  config: state.config,
  schema: state.schema
})

const mapDispatchToProps = dispatch => ({
  setContent: value => dispatch(actions.setContent(value)),
  setUserIsEditing: value => dispatch(actions.setUserIsEditing(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(DocFragment)
