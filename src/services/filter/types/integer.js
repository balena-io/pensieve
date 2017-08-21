const _ = require('lodash');

const p10 = val => parseInt(val, 10);

exports.rules = {
  equals: (target, value) => p10(target) === p10(value),
  'more than': (target, value) => p10(target) > p10(value),
  'less than': (target, value) => p10(target) < p10(value),
};

exports.validate = _.isInteger;
