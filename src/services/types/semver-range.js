const semver = require('resin-semver');
const _ = require('lodash');
const React = require('react');
const { Input } = require('rebass');

/**
 * See the node-semver docs for more information on semver ranges
 * https://github.com/npm/node-semver#ranges
 */
const rules = {
  contains: (target, value) => semver.satisfies(value, target),
  'does not contain': (target, value) => !semver.satisfies(value, target),
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
