import styled from 'styled-components';
import React from 'react';
import Color from 'color';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

const BaseBtn = styled.button`
  height: 32px;
  border-radius: 3px;
  font-size: inherit;
  min-width: 135px;
`;

const DefaultBtn = styled(BaseBtn)`
  border: solid 1px #9b9b9b;
  background: white;
  color: #3a3c41;


  &:hover,
  &:focus,
  &:active {
    background-color: #f3f3f3;
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

const ResinBtn = (props) => {
  const { color, ...other } = props;
  if (color === 'blue') {
    return <BlueBtn {...other} />;
  }
  return <DefaultBtn {...other} />;
};

ResinBtn.propTypes = {
  color: PropTypes.string,
};

export default ResinBtn;
