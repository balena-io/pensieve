const semver = require('resin-semver');
const _ = require('lodash');

exports.rules = {
  is: (target, value) => target && semver.compare(target, value) === 0,
  'is greater than': (target, value) => target && semver.gt(target, value),
  'is less than': (target, value) => target && semver.lt(target, value),
};

exports.validate = _.isString;
