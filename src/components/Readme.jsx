import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { Button, Flex, DeleteButton, PineTypes } from 'resin-components'
import { actions } from '../actions'
import { PlainPanel } from './shared'

class Readme extends Component {
  render () {
    if (!this.props.readme) {
      return null
    }

    if (this.props.readmeOpen) {
      return (
        <PlainPanel p={20} mb={40} style={{ position: 'relative' }}>
          <DeleteButton
            style={{ position: 'absolute', top: 0, right: 0 }}
            onClick={() => this.props.setReadmeOpen(false)}
          />
          <PineTypes.Text.Display data={this.props.readme} />
        </PlainPanel>
      )
    }

    return (
      <Flex justify='flex-end'>
        <Button w={135} primary onClick={() => this.props.setReadmeOpen(true)}>
          <FontAwesome name='info-circle' /> README
        </Button>
      </Flex>
    )
  }
}

const mapStatetoProps = state => ({
  readme: state.readme,
  readmeOpen: state.readmeOpen
})

const mapDispatchToProps = dispatch => ({
  setReadmeOpen: value => dispatch(actions.setReadmeOpen(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(Readme)
