import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { Input, Textarea, Flex, Box } from 'rebass'
import { DeleteBtn, FieldLabel } from '../shared'
import types from '../../services/types'

const StyledDeleteBtn = styled(DeleteBtn)`
  position: absolute;
  right: -35px;
  top: 2px;

  &:hover + ${Flex}:after {
    content: '';
    content: '';
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    position: absolute;
    left: -5px;
    right: -5px;
    top: -5px;
    bottom: -5px;
  }
`

const EditBox = styled(Box)`
  ${Input} {
    max-width: 300px;
    background-color: white;
  }

  ${Textarea} {
    resize: vertical;
    background-color: white;
  }
`

const calcTextareaSize = data => {
  let matches = data.match(/\n/g)
  if (!matches) {
    matches = 0
  }
  return Math.max(matches.length, 4)
}

const formatData = data => {
  if (_.isBoolean(data)) {
    return data ? 'true' : 'false'
  }
  if (_.isDate(data)) {
    return data.toString()
  }

  return data
}

const DocFragmentInput = ({ title, data, schema, change, remove }) => {
  const type = (schema && schema.type) || 'Unknown'

  const getInput = () => {
    if (type === 'Text' || type === 'Case Insensitive Text') {
      const Control = types[type].Edit
      return (
        <Control rows={calcTextareaSize(data)} value={data} onChange={change} />
      )
    }
    if (type in types) {
      const Control = types[type].Edit
      return <Control value={data} onChange={change} />
    }
    return (
      <Textarea
        rows={4}
        value={formatData(data)}
        onChange={e => change(e.target.value)}
      />
    )
  }

  if (_.isFunction(data)) {
    return null
  }

  return (
    <Box>
      {!!remove && <StyledDeleteBtn onClick={remove} />}
      <Flex>
        <Box width={250}>
          <FieldLabel>{title}</FieldLabel>
        </Box>
        <EditBox flex={1}>{getInput()}</EditBox>
      </Flex>
    </Box>
  )
}

export default DocFragmentInput
