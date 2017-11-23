import React from 'react'
import _ from 'lodash'
import { PineTypes } from 'resin-components'
import * as markdown from '../../services/markdown'

const DocFragmentField = ({ title, data, schema }) => {
  const type = (schema && schema.type) || 'Unknown'

  if (_.isFunction(data)) {
    return null
  }
  if (type in PineTypes) {
    const Display = PineTypes[type].Display
    return <Display data={data} />
  }
  return (
    <div
      className='markdown-body'
      dangerouslySetInnerHTML={{ __html: markdown.render(data) }}
    />
  )
}

export default DocFragmentField
