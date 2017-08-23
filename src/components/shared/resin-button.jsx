import styled from 'styled-components';
import React from 'react';
import Color from 'color';
import { colors } from '../../theme';

const BaseBtn = styled.button`
  height: 32px;
  border-radius: 3px;
  font-size: inherit;
  min-width: 135px;
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
`;

const DefaultBtn = styled(BaseBtn)`
  border: solid 1px #9b9b9b;
  background: none;
  color: #3a3c41;


  &:hover,
  &:focus,
  &:active {
    background-color: rgba(0,0,0,0.05);
  }
`;

const buttonMaker = (color, darkText = false) => {
  const textColor = darkText ? '#3a3c41' : 'white';
  return styled(BaseBtn)`
    border: 0;
    background: ${color};
    color: ${textColor};

    &:hover,
    &:focus,
    &:active {
      background-color: ${Color(color).darken(0.2).string()};
    }
  `;
};

const BlueBtn = buttonMaker(colors.blue);
const OrangeBtn = buttonMaker(colors.orange);

const ResinBtn = (props) => {
  const { color, ...other } = props;
  if (color === 'blue') {
    return <BlueBtn {...other} />;
  }
  if (color === 'orange') {
    return <OrangeBtn {...other} />;
  }
  return <DefaultBtn {...other} />;
};

export default ResinBtn;
