import React from 'react'
import _ from 'lodash'
import types from '../../services/types'

const DocFragmentField = ({ title, data, schema }) => {
  const type = (schema && schema.type) || 'Unknown'

  if (_.isFunction(data)) {
    return null
  }
  if (type in types) {
    const Display = types[type].Display
    return <Display data={data} />
  }
  return <div>{data}</div>
}

export default DocFragmentField
