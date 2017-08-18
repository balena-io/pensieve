import React from 'react';
import { Fixed } from 'rebass';
import styled from 'styled-components';
import PlainPanel from './plain-panel';

const MODAL_WIDTH = 666;

const ModalPanel = styled(PlainPanel)`
  position: fixed;
  width: ${MODAL_WIDTH}px;
  top: 225px;
  min-height: 50px;
  left: 50%;
  margin-left: -${MODAL_WIDTH / 2}px;
  padding: 15px;
  z-index: 10;
`;

const Modal = props =>
  (<div>
    <Fixed z={9} bg="rgba(0,0,0,0.5)" top right bottom left onClick={() => props.cancel()} />
    <ModalPanel>
      {props.children}
    </ModalPanel>
  </div>);

export default Modal;
