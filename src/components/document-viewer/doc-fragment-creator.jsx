import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import _ from 'lodash'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Box, Input, Text, Flex } from 'rebass'
import {
  Container,
  ResinBtn,
  UnstyledList,
  FieldLabel,
  GreyDivider
} from '../shared'
import * as DocumentService from '../../services/document'
import { lint, schemaValidate } from '../../services/validator'
import {
  PensieveLinterError,
  PensieveValidationError
} from '../../services/errors'
import { actions } from '../../actions'
import DocFragmentInput from './doc-fragment-input'
import * as NotificationService from '../../services/notifications'

const SAVE_CHANGE_DEBOUNCE = 1000

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`

const InputListItem = styled.li`
  position: relative;
  margin-bottom: 28px;
`

const Wrapper = styled.div`
  background-color: #f6f6f6;
  border-bottom: 2px solid #cccccc;
  margin-bottom: -10px;
  padding-bottom: 60px;
`

class DocFragmentCreator extends Component {
  constructor (props) {
    super(props)

    const content = _.reduce(
      this.props.schema,
      (carry, value) => {
        carry[value.name] = ''
        return carry
      },
      {}
    )

    this.state = {
      showEditor: false,
      lintError: null,
      validationError: null,
      message: '',
      content,
      newFieldTitle: ''
    }

    this.saveChange = _.debounce(
      () => {
        const source = _.pickBy(this.state.content, val => val !== '')
        const title = this.state.content[this.props.schema[0].name]
        const message = `Created entry "${title}"`

        lint(source)
          // When validating, strip the title field from the source
          .then(() => schemaValidate(this.props.schema, source))
          .then(() => {
            this.setState({
              loading: true,
              validationError: null
            })

            return DocumentService.commitFragment(source, message).then(() => {
              this.props.close()
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
      },
      SAVE_CHANGE_DEBOUNCE,
      { leading: true, trailing: false }
    )
  }

  handleChange () {
    const sourceCode = this.refs.ace.editor.getValue()
    this.setState({ sourceCode })
    lint(sourceCode)
      .then(() => {
        this.setState({ lintError: null })
      })
      .catch(err => {
        this.setState({ lintError: err.message })
      })
  }

  removeField (name) {
    const content = this.state.content
    delete content[name]
    this.setState({ content })
  }

  handleFieldEdit (name, val) {
    const content = this.state.content
    content[name] = val
    this.setState({ content })
  }

  handleNewFieldTitleEdit (e) {
    const val = e.target.value
    this.setState({ newFieldTitle: val })
  }

  addNewField (e) {
    e.preventDefault()
    const content = this.state.content
    content[this.state.newFieldTitle] = ''
    this.setState({
      content,
      newFieldTitle: ''
    })
  }

  findSchemaEntry (name) {
    return _.find(this.props.schema, x => x.name === name)
  }

  render () {
    return (
      <Wrapper>
        <GreyDivider />

        <Container>
          {this.state.loading ? (
            <FontAwesome style={{ float: 'right' }} spin name='cog' />
          ) : (
            <Flex align='right' justify='flex-end' style={{ marginBottom: 30 }}>
              <ResinBtn
                style={{ marginRight: 10 }}
                onClick={() => this.props.close()}
              >
                <FontAwesome name='tick' style={{ marginRight: 10 }} />
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
          <UnstyledList>
            {_.map(this.state.content, (data, name) => (
              <InputListItem>
                <DocFragmentInput
                  data={data}
                  title={name}
                  schema={this.findSchemaEntry(name)}
                  change={val => this.handleFieldEdit(name, val)}
                  remove={() => this.removeField(name)}
                />
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
      </Wrapper>
    )
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
  config: state.config
})

const mapDispatchToProps = dispatch => ({
  setContent: value => dispatch(actions.setContent(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(DocFragmentCreator)
