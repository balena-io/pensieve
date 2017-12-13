import styled from 'styled-components'
import { Box, Theme } from 'resin-components'

const PlainPanel = styled(Box)`
  border-radius: ${Theme.radius}px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  border: solid 1px #dfdede;
`

export default PlainPanel
