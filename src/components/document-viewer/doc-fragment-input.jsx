import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import {
  DeleteButton,
  Input,
  Textarea,
  Flex,
  Box,
  PineTypes
} from 'resin-components'
import FontAwesome from 'react-fontawesome'
import { FieldLabel } from '../shared'
import MarkdownMark from '../MarkdownMark'

const markStyle = {
  display: 'inline-block',
  transform: 'translateY(3px)',
  marginLeft: 10
}

const StyledDeleteBtn = styled(DeleteButton)`
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

const DiffArrowWrapper = styled.div`
  text-align: center;
  padding-top: 4px;
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

  &.diff-display {
    ${Input} {
      background: #e6ffed;
    }

    ${Textarea} {
      background: #e6ffed;
    }
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

const DocFragmentInput = ({ title, data, schema, change, remove, diff }) => {
  const type = (schema && schema.type) || 'Unknown'

  const getInput = () => {
    if (type === 'Text' || type === 'Case Insensitive Text') {
      const Control = PineTypes[type].Edit
      return (
        <Control rows={calcTextareaSize(data)} value={data} onChange={change} />
      )
    }
    if (type in PineTypes) {
      const Control = PineTypes[type].Edit
      return <Control value={data} onChange={change} />
    }

    // Just return a short text input for the entry title
    if (title === 'Entry title') {
      return (
        <Input
          value={formatData(data)}
          onChange={e => change(e.target.value)}
        />
      )
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

  const supportsMarkdown = () =>
    title !== 'Entry title' &&
    (type === 'Text' ||
      type === 'Case Insensitive Text' ||
      !(type in PineTypes))

  return (
    <Box>
      {!!remove && <StyledDeleteBtn onClick={remove} />}
      <Flex>
        {diff ? (
          <Box width={100}>
            <DiffArrowWrapper>
              <FontAwesome name='arrow-right' />
            </DiffArrowWrapper>
          </Box>
        ) : (
          <Box width={250}>
            <FieldLabel>
              {title}
              {supportsMarkdown() && <MarkdownMark style={markStyle} />}
            </FieldLabel>
          </Box>
        )}
        <EditBox className={diff ? 'diff-display' : ''} flex={1}>
          {getInput()}
        </EditBox>
      </Flex>
    </Box>
  )
}

export default DocFragmentInput
