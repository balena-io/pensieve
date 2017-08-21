import React from 'react';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';

const ButtonWrapper = styled.button`
  font-size: 13px;
  height: 22px;
  border: 0;
  border-radius: 3px;
  background-color: #e9e9e9;
  padding: 3px 8px;
`;

const DeleteButton = styled.button`
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

const FilterDescription = props =>
  (<div>
    {!!props.delete &&
      <DeleteButton onClick={props.delete}>
        <FontAwesome name="times" />
      </DeleteButton>}

    <ButtonWrapper onClick={!!props.edit && props.edit}>
      {props.rule.name}{' '}
      <strong style={{ marginLeft: 7, marginRight: 7 }}>{props.rule.operator}</strong>{' '}
      <em>{props.rule.value}</em>
    </ButtonWrapper>
  </div>);

export default FilterDescription;
