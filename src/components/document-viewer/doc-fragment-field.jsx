import React from 'react'
import _ from 'lodash'
import types from '../../services/types'
import * as markdown from '../../services/markdown'

const DocFragmentField = ({ title, data, schema }) => {
  const type = (schema && schema.type) || 'Unknown'

  if (_.isFunction(data)) {
    return null
  }
  if (type in types) {
    const Display = types[type].Display
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
