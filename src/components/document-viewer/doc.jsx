import React, { Component } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import DocFragment from './doc-fragment'
import { GitHubMarkdown, UnstyledList } from '../shared'
import SchemaSeive from '../../services/filter'

const seive = SchemaSeive()

const canShowFrag = (fragment, rules) => {
  let source = _.cloneDeep(fragment)

  rules.forEach(rule => {
    source = seive.filter(source, rule)
  })

  return Object.keys(source).length > 0
}

class Doc extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editMode: false
    }
  }

  componentDidMount () {
    // Anchor links don't work because the document data isn't displayed
    // immediately on page load. To get around this, we wait for the doc
    // component to mount and then 'flicker' the hash fragment, triggering the
    // default browser behaviour and scrolling to the anchor.
    const hash = window.location.hash
    window.location.hash = ''
    window.location.hash = hash
  }

  render () {
    const frags = _.map(this.props.content, value => {
      if (!value || !canShowFrag({ key: value }, this.props.rules)) {
        return null
      }

      return (
        <DocFragment
          key={value.getUuid()}
          content={value}
          schema={this.props.schema}
        />
      )
    })

    return (
      <GitHubMarkdown>
        <UnstyledList>{frags}</UnstyledList>
      </GitHubMarkdown>
    )
  }
}

const mapStatetoProps = ({ rules, content, schema }) => ({
  rules,
  content,
  schema
})

export default connect(mapStatetoProps)(Doc)
