import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { Flex, Box, Textarea } from 'rebass'
import styled from 'styled-components'
import _ from 'lodash'
import { connect } from 'react-redux'
import { actions } from '../actions'
import { commitFragment } from '../services/document'
import { ResinBtn, GreyDivider, GitHubMarkdown } from './shared'
import Container from './shared/container'
import { convert } from '../services/importer'
import * as NotificationService from '../services/notifications'

const IMPORT_DEBOUNCE = 1000

const HelperText = styled.div`
  background: white;
  border-radius: 3px;
  padding: 20px;
`

const Wrapper = styled.div`
  background-color: #f3f3f3;
  border-bottom: 2px solid #cccccc;
  margin-bottom: -10px;
  padding-bottom: 60px;
`

class SchemaEditor extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      markdown: ''
    }

    this.import = _.debounce(
      () => {
        const { markdown } = this.state
        if (!markdown.trim().length) {
          return
        }
        const entries = convert(this.props.schema, markdown)
        this.setState({ loading: true })
        commitFragment(
          entries,
          `Imported ${entries.length} entr${entries.length > 1
            ? 'ies'
            : 'y'} from markdown`
        )
          .catch(err => {
            NotificationService.error(err)
          })
          .finally(() => {
            this.setState({
              loading: false
            })
            this.props.close()
          })
      },
      IMPORT_DEBOUNCE,
      {
        leading: true,
        trailing: false
      }
    )
  }

  render () {
    return (
      <Wrapper>
        <GreyDivider />
        <Container>
          <Flex justify='space-between'>
            <h2 style={{ marginTop: 0 }}>Import Markdown</h2>
            {this.state.loading ? (
              <Box>
                <FontAwesome spin name='cog' />
              </Box>
            ) : (
              <Flex
                align='right'
                justify='flex-end'
                style={{ marginBottom: 30 }}
              >
                <ResinBtn
                  style={{ marginRight: 10 }}
                  onClick={() => this.props.close()}
                >
                  Cancel
                </ResinBtn>
                <ResinBtn secondary onClick={() => this.import()}>
                  <FontAwesome name='check' style={{ marginRight: 10 }} />
                  Import
                </ResinBtn>
              </Flex>
            )}
          </Flex>

          <GitHubMarkdown>
            <HelperText className='markdown-body'>
              <p>
                Import markdown, converting the document into Pensieve entries.
              </p>
              <p>
                An entry is denoted by an h2 tag (<code>##</code> in markdown),
                all text until the next h2 tag is considered to be part of the
                entry. The value of the h2 tag is used as the entry title. The
                first element in the schema is treated as the entry title.
              </p>
              <p>
                Any h3 tag (<code>###</code> in markdown) is converted to an
                entry field. The value of the h3 tag is used as the entry
                field's name and all text until the next occurring h3 tag is
                considered to be the value of the field.
              </p>
              <p>
                If there is text immediately after an h2 tag, it is added to the
                entry using the key <code>Imported copy</code>.
              </p>
            </HelperText>
          </GitHubMarkdown>

          <Textarea
            style={{
              fontFamily:
                '"SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace'
            }}
            mt={60}
            p={20}
            rows={30}
            placeholder='Enter markdown here...'
            bg='white'
            value={this.state.markdown}
            onChange={e => this.setState({ markdown: e.target.value })}
          />
        </Container>
      </Wrapper>
    )
  }
}

const mapStatetoProps = state => ({
  schema: state.schema,
  content: state.content
})

const mapDispatchToProps = dispatch => ({
  setIsEditingSchema: value => dispatch(actions.setIsEditingSchema(value)),
  setSchema: value => dispatch(actions.setSchema(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(SchemaEditor)
