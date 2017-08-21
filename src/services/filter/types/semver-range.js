const semver = require('resin-semver');
const _ = require('lodash');

/**
 * See the node-semver docs for more information on semver ranges
 * https://github.com/npm/node-semver#ranges
 */
exports.rules = {
  contains: (target, value) => semver.satisfies(value, target),
  'does not contain': (target, value) => !semver.satisfies(value, target),
};

exports.validate = _.isString;
