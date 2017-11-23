import React, { Component } from 'react'
import _ from 'lodash'
import jsyaml from 'js-yaml'
import { Flex, Box, Button } from 'resin-components'
import styled from 'styled-components'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import * as GitHubService from '../../services/github'
import * as DocumentService from '../../services/document'
import { actions } from '../../actions'
import Filters from '../filters'
import Doc from './doc'
import DocFragmentCreator from './doc-fragment-creator'
import SchemaEditor from '../schema-editor'
import MarkdownImporter from '../MarkdownImporter'
import { Container } from '../shared'
import { colors } from '../../theme'
import { dataStructureNeedsUpdate } from '../../util'

const SkeleBtn = styled(Button)`
  color: ${colors.blue};
  border: 0;
  > span {
    border-bottom: 1px solid;
    padding-bottom: 3px;
  }
`

class DocumentViewer extends Component {
  constructor (props) {
    super(props)

    this.upateLock = false

    this.state = {
      filterRules: [],
      updating: false,
      showImportMarkdownForm: false
    }
  }

  editSchema () {
    this.props.setIsEditingSchema(true)
  }

  updateDataStructure () {
    if (this.updateLock) {
      return
    }

    this.updateLock = true
    this.setState({ updating: true })

    const transformedSchema = _.map(this.props.schema, (value, key) => {
      return _.assign({}, { name: key }, value)
    })
    // Add a new 'title' field to the beginning of the schema, as the first
    // element of the schema indicates the title of an entry
    transformedSchema.unshift({
      name: 'title',
      type: 'Case Insensitive Text'
    })
    DocumentService.updateAndCommitDocumentStructure(this.props.content)
      .then(() =>
        GitHubService.commitSchema({
          content: jsyaml.safeDump(transformedSchema),
          message: 'Update schema to v2 structure'
        })
      )
      .then(() => {
        this.props.setSchema(transformedSchema)
      })
      .then(() => {
        this.updateLock = false
        this.setState({ updating: false })
      })
  }

  render () {
    const schemaIsEditable = _.isString(this.props.config.schema)

    if (this.state.updating) {
      return (
        <Container mt={40}>
          <FontAwesome spin name='cog' />
        </Container>
      )
    }

    if (dataStructureNeedsUpdate(this.props.content)) {
      return (
        <Box mt={40}>
          <Container>
            <p>
              You will need to update your Pensieve installation to continue.
            </p>
            <Button primary onClick={() => this.updateDataStructure()}>
              Update now
            </Button>
          </Container>
        </Box>
      )
    }

    return (
      <Box mt={40}>
        <Container>
          <Filters schema={this.props.schema} />
          <Flex justify='space-between'>
            <Button
              onClick={() => this.setState({ showImportMarkdownForm: true })}
            >
              <FontAwesome name='file-text-o' style={{ marginRight: 10 }} />
              Import markdown
            </Button>

            <Flex align='right' justify='flex-end' style={{ marginBottom: 30 }}>
              {schemaIsEditable && (
                <SkeleBtn
                  style={{ marginRight: 10 }}
                  onClick={() => this.editSchema()}
                >
                  <span>
                    <FontAwesome name='list-alt' style={{ marginRight: 10 }} />
                    Edit schema
                  </span>
                </SkeleBtn>
              )}
              <Button onClick={() => this.setState({ showNewEntryForm: true })}>
                <FontAwesome name='plus' style={{ marginRight: 10 }} />
                Add entry
              </Button>
            </Flex>
          </Flex>
        </Container>
        {this.props.isEditingSchema && <SchemaEditor />}
        {this.state.showImportMarkdownForm && (
          <MarkdownImporter
            schema={this.props.schema}
            close={() => this.setState({ showImportMarkdownForm: false })}
          />
        )}
        {this.state.showNewEntryForm && (
          <DocFragmentCreator
            schema={this.props.schema}
            close={() => this.setState({ showNewEntryForm: false })}
          />
        )}

        <Doc />
      </Box>
    )
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content,
  config: state.config,
  isEditingSchema: state.isEditingSchema
})

const mapDispatchToProps = dispatch => ({
  setIsEditingSchema: value => dispatch(actions.setIsEditingSchema(value)),
  setSchema: value => dispatch(actions.setSchema(value)),
  setContent: value => dispatch(actions.setContent(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(DocumentViewer)
