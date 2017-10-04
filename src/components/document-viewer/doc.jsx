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

  render () {
    const frags = _.map(this.props.content, (value, key) => {
      if (canShowFrag({ key: value }, this.props.rules)) {
        return (
          <DocFragment
            key={value.getUuid()}
            title={key}
            content={value}
            schema={this.props.schema}
          />
        )
      }

      return null
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
