const moment = require('moment');
/**
  Date Time types use momentjs for comparison, so the input and target value
  should be in one of the following forms:
  - ISO 8601
  - Unix timestamp (seconds or milliseconds)
  - JS Date object
  See https://momentjs.com/docs/#/parsing/ for more information
*/
exports.rules = {
  is: (target, value) => target && moment(target).isSame(value),
  'is before': (target, value) => target && moment(target).isBefore(value),
  'is after': (target, value) => target && moment(target).isAfter(value),
};

exports.validate = value => moment(value).isValid();
