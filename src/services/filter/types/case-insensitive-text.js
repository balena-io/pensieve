const RegexParser = require('regex-parser');
const _ = require('lodash');

const toLowerCase = fn => (target, value) => fn(target.toLowerCase(), value.toLowerCase());

exports.rules = {
  is: toLowerCase((target = '', value) => target === value),
  contains: toLowerCase((target = '', value) => target.includes(value)),
  'does not contain': toLowerCase((target = '', value) => !target.includes(value)),
  'matches RegEx': toLowerCase((target = '', value) => target.match(RegexParser(value))),
  'does not match RegEx': toLowerCase((target = '', value) => !target.match(RegexParser(value))),
};

exports.validate = _.isString;
