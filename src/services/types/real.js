const _ = require('lodash');
const React = require('react');
const { Input } = require('rebass');

const pF = val => parseFloat(val);

const rules = {
  equals: (target, value) => pF(target) === pF(value),
  'more than': (target, value) => pF(target) > pF(value),
  'less than': (target, value) => pF(target) < pF(value),
};

const validate = _.isNumber;

const Edit = ({ value, onChange, ...props }) =>
  <Input {...props} type="number" value={value} onChange={e => onChange(pF(e.target.value))} />;

const Display = ({ data, ...props }) =>
  (<div {...props}>
    <span>
      {pF(data)}
    </span>
  </div>);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
