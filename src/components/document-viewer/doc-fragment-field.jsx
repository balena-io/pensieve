import React from 'react'
import _ from 'lodash'
import showdown from 'showdown'
import types from '../../services/types'

const converter = new showdown.Converter()

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
      dangerouslySetInnerHTML={{ __html: converter.makeHtml(data) }}
    />
  )
}

export default DocFragmentField
