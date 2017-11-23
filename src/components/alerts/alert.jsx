import React from 'react'
import styled from 'styled-components'
import { DeleteButton } from 'resin-components'
import { colors } from '../../theme'

const AlertElement = styled.div`
  border-radius: 4px;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 15px;
  padding-right: 30px;
  position: relative;
  margin-top: 10px;
  margin-bottom: 10px;

  &.error {
    background-color: ${colors.red};
  }

  &.success {
    background-color: ${colors.green};
  }

  &.warning {
    background-color: ${colors.orange};
  }

  &.info {
    background-color: ${colors.blue};
  }

  & .dismissBtn {
    position: absolute;
    right: 9px;
    top: 6px;
  }
`

const Alert = props => (
  <AlertElement className={props.type}>
    {!!props.dismiss && (
      <DeleteButton className='dismissBtn' onClick={props.dismiss} />
    )}
    {props.children}
  </AlertElement>
)

export default Alert
