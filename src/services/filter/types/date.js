const moment = require('moment');
/**
  Date compares the day as the lowest level of granularity.
  Date types use momentjs for comparison, so the input and target value
  should be in one of the following forms:
  - ISO 8601
  - Unix timestamp (seconds or milliseconds)
  - JS Date object
  See https://momentjs.com/docs/#/parsing/ for more information
*/
const startOfDay = val => moment(val).startOf('day');

exports.rules = {
  is: (target, value) => target && startOfDay(target).isSame(startOfDay(value)),
  'is before': (target, value) => target && startOfDay(target).isBefore(startOfDay(value)),
  'is after': (target, value) => target && startOfDay(target).isAfter(startOfDay(value)),
};

exports.validate = value => moment(value).isValid();
