import _ from 'lodash';
import React from 'react';
import { Input } from 'rebass';

const pF = val => parseFloat(val);

export const rules = {
  equals: (target, value) => pF(target) === pF(value),
  'more than': (target, value) => pF(target) > pF(value),
  'less than': (target, value) => pF(target) < pF(value),
};

export const validate = _.isNumber;

export const Edit = ({ value, onChange, ...props }) =>
  <Input {...props} type="number" value={value} onChange={e => onChange(pF(e.target.value))} />;

export const Display = ({ data, ...props }) =>
  (<div {...props}>
    <span>
      {pF(data)}
    </span>
  </div>);
