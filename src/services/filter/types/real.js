const _ = require('lodash');

const pF = val => parseFloat(val);

exports.rules = {
  equals: (target, value) => pF(target) === pF(value),
  'more than': (target, value) => pF(target) > pF(value),
  'less than': (target, value) => pF(target) < pF(value),
};

exports.validate = _.isNumber;
