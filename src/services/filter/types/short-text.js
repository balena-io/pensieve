const RegexParser = require('regex-parser');
const _ = require('lodash');

exports.rules = {
  is: (target = '', value) => target === value,
  contains: (target = '', value) => target.includes(value),
  'does not contain': (target = '', value) => !target.includes(value),
  'matches RegEx': (target = '', value) => target.match(RegexParser(value)),
  'does not match RegEx': (target = '', value) => !target.match(RegexParser(value)),
};

exports.validate = val => _.isString(val) && val.length <= 255;
