const React = require('react');
const { Select } = require('rebass');
const _ = require('lodash');

const Edit = ({ value, onChange, ...props }) =>
  (<Select
    {...props}
    value={value ? 'true' : 'false'}
    onChange={e => onChange(e.target.value === 'true')}
  >
    <option>true</option>
    <option>false</option>
  </Select>);

const rules = {
  'is true': target => !!target,
  'is false': target => !target,
};

const validate = _.isBoolean;

const Display = ({ data, ...props }) =>
  (<div {...props}>
    <span>
      {data ? 'true' : 'false'}
    </span>
  </div>);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
