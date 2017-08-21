const _ = require('lodash');

exports.rules = {
  'is true': target => !!target,
  'is false': target => !target,
};

exports.validate = _.isBoolean;
