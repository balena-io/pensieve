import RegexParser from 'regex-parser'
import _ from 'lodash'
import React from 'react'
import { Textarea } from 'rebass'
import * as markdown from '../markdown'

export const rules = {
  is: (target = '', value) => target === value,
  contains: (target = '', value) => target.includes(value),
  'does not contain': (target = '', value) => !target.includes(value),
  'matches RegEx': (target = '', value) => target.match(RegexParser(value)),
  'does not match RegEx': (target = '', value) =>
    !target.match(RegexParser(value))
}

export const validate = _.isString

export const Edit = ({ onChange, ...props }) => (
  <Textarea onChange={e => onChange(e.target.value)} {...props} />
)

export const Display = ({ data, ...props }) => (
  <div
    {...props}
    className='markdown-body'
    dangerouslySetInnerHTML={{ __html: markdown.render(data) }}
  />
)
