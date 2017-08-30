import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';
import React from 'react';

const BtnWrapper = styled.button`
  border: 0;
  background: none;
  padding: 4px;
  font-size: 14px;
  margin-left: 5px;
  color: rgba(0, 0, 0, 0.4);
  cursor: pointer;

  &:hover {
    color: black;
  }
`;

const DeleteBtn = (props) => {
  const { ...other } = props;
  return (
    <BtnWrapper {...other}>
      <FontAwesome name="times" />
    </BtnWrapper>
  );
};
export default DeleteBtn;
