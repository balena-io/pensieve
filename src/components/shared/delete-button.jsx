import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';
import React from 'react';

const BtnWrapper = styled.button`
  border: 0;
  background: none;
  padding: 4px;
  font-size: 14px;
  margin-right: 5px;
  color: #9b9b9b;

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
