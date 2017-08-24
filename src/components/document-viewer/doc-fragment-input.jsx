import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Select, Input, Textarea, Flex, Box } from 'rebass';
import { DeleteBtn, FieldLabel } from '../shared';

const StyledDeleteBtn = styled(DeleteBtn)`
  position: absolute;
  right: -35px;
  top: 2px;

  &:hover + ${Flex}:after {
    content: '';
    content: '';
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
    position: absolute;
    left: -5px;
    right: -5px;
    top: -5px;
    bottom: -5px;
  }
`;

const ShortInput = styled(Input)`
  max-width: 300px;
  background-color: white;
`;

const ShortSelect = styled(Select)`
  max-width: 300px;
  background-color: white;
`;

const calcTextareaSize = (data) => {
  let matches = data.match(/\n/g);
  if (!matches) {
    matches = 0;
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
    return <ShortInput value={formatData(data)} onChange={changeTransform} />;
  };

  if (_.isFunction(data)) {
    return null;
  }

  return (
    <Box>
      {!!remove && <StyledDeleteBtn onClick={remove} />}
      <Flex>
        <Box width={250}>
          <FieldLabel>
            {title}
          </FieldLabel>
        </Box>
        <Box flex={1}>
          {getInput()}
        </Box>
      </Flex>
    </Box>
  );
};

export default DocFragmentInput;
