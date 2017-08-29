const RegexParser = require('regex-parser');
const _ = require('lodash');
const React = require('react');
const { Input } = require('rebass');
const showdown = require('showdown');

const converter = new showdown.Converter();

const rules = {
  is: (target = '', value) => target === value,
  contains: (target = '', value) => target.includes(value),
  'does not contain': (target = '', value) => !target.includes(value),
  'matches RegEx': (target = '', value) => target.match(RegexParser(value)),
  'does not match RegEx': (target = '', value) => !target.match(RegexParser(value)),
};

const validate = val => _.isString(val) && val.length <= 255;

const Edit = ({ onChange, ...props }) =>
  <Input type="text" onChange={e => onChange(e.target.value)} {...props} />;

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
