const moment = require('moment');
const React = require('react');
const { Input } = require('rebass');

/**
  Date Time types use momentjs for comparison, so the input and target value
  should be in one of the following forms:
  - ISO 8601
  - Unix timestamp (seconds or milliseconds)
  - JS Date object
  See https://momentjs.com/docs/#/parsing/ for more information
*/
const rules = {
  is: (target, value) => target && moment(target).isSame(value),
  'is before': (target, value) => target && moment(target).isBefore(value),
  'is after': (target, value) => target && moment(target).isAfter(value),
};

const validate = value => moment(value).isValid();

const Edit = ({ value, onChange, ...props }) =>
  <Input {...props} type="datetime-local" value={value} onChange={e => onChange(e.target.value)} />;

const Display = ({ data, ...props }) =>
  (<div {...props}>
    <span>
      {moment(data).format('dddd, MMMM Do YYYY, h:mm:ss a')}
    </span>
  </div>);

module.exports = {
  rules,
  validate,
  Edit,
  Display,
};
