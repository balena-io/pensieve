const RegexParser = require('regex-parser');
const _ = require('lodash');
const React = require('react');
const { Textarea } = require('rebass');
const showdown = require('showdown');

const converter = new showdown.Converter();

const rules = {
  is: (target = '', value) => target === value,
  contains: (target = '', value) => target.includes(value),
  'does not contain': (target = '', value) => !target.includes(value),
  'matches RegEx': (target = '', value) => target.match(RegexParser(value)),
  'does not match RegEx': (target = '', value) => !target.match(RegexParser(value)),
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
