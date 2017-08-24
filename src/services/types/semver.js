const semver = require('resin-semver');
const _ = require('lodash');
const React = require('react');
const { Input } = require('rebass');

const rules = {
  is: (target, value) => target && semver.compare(target, value) === 0,
  'is greater than': (target, value) => target && semver.gt(target, value),
  'is less than': (target, value) => target && semver.lt(target, value),
};

const validate = _.isString;

const Edit = ({ value, onChange, ...props }) =>
  <Input {...props} type="text" value={value} onChange={e => onChange(e.target.value)} />;

const Display = ({ data, ...props }) =>
  (<div {...props} className="markdown-body">
    <code>
      {data}
    </code>
  </div>);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
