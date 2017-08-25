const _ = require('lodash');
const React = require('react');
const { Input } = require('rebass');

const p10 = val => parseInt(val, 10);

const rules = {
  equals: (target, value) => p10(target) === p10(value),
  'more than': (target, value) => p10(target) > p10(value),
  'less than': (target, value) => p10(target) < p10(value),
};

const validate = _.isInteger;

const Edit = ({ value, onChange, ...props }) =>
  <Input {...props} type="number" value={value} onChange={e => onChange(p10(e.target.value))} />;

const Display = ({ data, ...props }) =>
  (<div {...props}>
    <span>
      {p10(data)}
    </span>
  </div>);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
