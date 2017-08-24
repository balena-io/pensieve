const RegexParser = require('regex-parser');
const _ = require('lodash');
const React = require('react');
const { Textarea } = require('rebass');
const showdown = require('showdown');

const converter = new showdown.Converter();

const toLowerCase = fn => (target, value) => fn(target.toLowerCase(), value.toLowerCase());

const rules = {
  is: toLowerCase((target = '', value) => target === value),
  contains: toLowerCase((target = '', value) => target.includes(value)),
  'does not contain': toLowerCase((target = '', value) => !target.includes(value)),
  'matches RegEx': toLowerCase((target = '', value) => target.match(RegexParser(value))),
  'does not match RegEx': toLowerCase((target = '', value) => !target.match(RegexParser(value))),
};

const validate = _.isString;

const Edit = ({ ...props }) => <Textarea {...props} />;

const Display = ({ data, ...props }) =>
  (<div
    {...props}
    className="markdown-body"
    dangerouslySetInnerHTML={{ __html: converter.makeHtml(data) }}
  />);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
