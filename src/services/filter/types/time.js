const moment = require('moment');
/**
  Time types compare the time section only and ignore date.
  Time types use momentjs for comparison, so the input and target value
  should be in one of the following forms:
  - ISO 8601
  - Unix timestamp (seconds or milliseconds)
  - JS Date object
  See https://momentjs.com/docs/#/parsing/ for more information
*/
const timeOfDay = val => moment(`Thu, 01 Jan 1970 ${moment(val).format('HH:mm:ss:SS')}`);

exports.rules = {
  is: (target, value) => target && timeOfDay(target).isSame(timeOfDay(value)),
  'is before': (target, value) => target && timeOfDay(target).isBefore(timeOfDay(value)),
  'is after': (target, value) => target && timeOfDay(target).isAfter(timeOfDay(value)),
};

exports.validate = value => moment(value).isValid();
