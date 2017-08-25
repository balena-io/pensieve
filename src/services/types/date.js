const moment = require('moment');
const React = require('react');
const { Input } = require('rebass');

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

const rules = {
  is: (target, value) => target && startOfDay(target).isSame(startOfDay(value)),
  'is before': (target, value) => target && startOfDay(target).isBefore(startOfDay(value)),
  'is after': (target, value) => target && startOfDay(target).isAfter(startOfDay(value)),
};

const validate = value => moment(value).isValid();

const Edit = ({ value, onChange, ...props }) =>
  <Input {...props} type="date" value={value} onChange={e => onChange(e.target.value)} />;

const Display = ({ data, ...props }) =>
  (<div {...props}>
    <span>
      {moment(data).format('dddd, MMMM Do YYYY')}
    </span>
  </div>);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
