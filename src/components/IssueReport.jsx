import platform from 'platform'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { Input, Textarea, Box, Button, Modal } from 'resin-components'
import { submitPensieveIssue } from '../services/github'

console.log(platform)

export default class IssueReport extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showModal: false,
      loading: false,
      title: '',
      body: ''
    }
  }

  submit () {
    this.setState({ loading: true })
    const body = `
${this.state.body}

*Sent from: ${platform.description}*
    `

    submitPensieveIssue(this.state.title, body).finally(() =>
      this.setState({
        showModal: false,
        loading: false,
        title: '',
        body: ''
      })
    )
  }

  render () {
    return (
      <Box>
        <Button plaintext onClick={() => this.setState({ showModal: true })}>
          Report an Issue
        </Button>

        {this.state.showModal && (
          <Modal
            title='Report an issue'
            cancel={() => this.setState({ showModal: false })}
            done={() => this.submit()}
            action='Send report'
          >
            {this.state.loading ? (
              <FontAwesome spin name='cog' />
            ) : (
              <Box>
                <Input
                  w='100%'
                  mb={3}
                  value={this.state.title}
                  placeholder='Issue title'
                  onChange={e => this.setState({ title: e.target.value })}
                />

                <Textarea
                  value={this.state.body}
                  rows={10}
                  onChange={e => this.setState({ body: e.target.value })}
                />
              </Box>
            )}
          </Modal>
        )}
      </Box>
    )
  }
}
