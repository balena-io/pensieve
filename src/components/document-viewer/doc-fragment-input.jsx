import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Select, Input, Textarea } from 'rebass';
import { DeleteBtn } from '../shared';

const DeleteBtnStyle = {
  position: 'absolute',
  left: -30,
  bottom: 3,
};

const InputListItem = styled.li`
  position: relative;
  margin-bottom: 28px;
`;

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`;

const ShortSelect = styled(Select)`
  max-width: 300px;
  background-color: white;
`;

const FieldHeader = styled.h3`margin-bottom: 5px;`;

const calcTextareaSize = (data) => {
  let matches = data.match(/\n/g);
  if (!matches) {
    matches = 0;
  }
  if (matches === 0 && data.length < 30) {
    return 1;
  }
  return Math.max(matches.length, 4);
};

const formatData = (data) => {
  if (_.isBoolean(data)) {
    return data ? 'true' : 'false';
  }
  if (_.isDate(data)) {
    return data.toString();
  }

  return data;
};

const DocFragmentInput = ({ title, data, schema, change, remove }) => {
  const type = (schema && schema.type) || 'Unknown';
  const changeTransform = (e) => {
    const val = e.target.value;
    if (type === 'Boolean') {
      return change(val === 'true');
    }
    if (type === 'Integer' || type === 'Real' || type === 'number') {
      return change(parseFloat(val));
    }

    return change(val);
  };

  const getInput = () => {
    if (
      type === 'Text' ||
      type === 'Short Text' ||
      type === 'Case Insensitive Text' ||
      type === 'string'
    ) {
      return (
        <Textarea
          style={{ backgroundColor: 'white' }}
          rows={calcTextareaSize(data)}
          value={data}
          onChange={changeTransform}
        />
      );
    }
    if (type === 'Boolean') {
      return (
        <ShortSelect value={formatData(data)} onChange={changeTransform}>
          <option>true</option>
          <option>false</option>
        </ShortSelect>
      );
    }
    if (type === 'Integer' || type === 'Real' || type === 'number') {
      return <ShortInput type="number" value={data} onChange={changeTransform} />;
    }
    if (type === 'Date') {
      return <ShortInput type="date" value={data} onChange={changeTransform} />;
    }
    return <ShortInput value={formatData(data)} />;
  };

  if (_.isFunction(data)) {
    return null;
  }

  return (
    <InputListItem>
      <DeleteBtn style={DeleteBtnStyle} onClick={remove} />
      <FieldHeader>
        {title}
      </FieldHeader>
      {getInput()}
    </InputListItem>
  );
};

export default DocFragmentInput;
