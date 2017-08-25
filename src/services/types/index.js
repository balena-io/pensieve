const BooleanType = require('./boolean');
const CaseInsensitiveTextType = require('./case-insensitive-text');
const DateTimeType = require('./date-time');
const DateType = require('./date');
const IntegerType = require('./integer');
const RealType = require('./real');
const ShortTextType = require('./short-text');
const TextType = require('./text');
const TimeType = require('./time');

const SemverRangeType = require('./semver-range');
const SemverType = require('./semver');

module.exports = {
  Boolean: BooleanType,
  'Case Insensitive Text': CaseInsensitiveTextType,
  'Date Time': DateTimeType,
  Date: DateType,
  Integer: IntegerType,
  Real: RealType,
  'Short Text': ShortTextType,
  Text: TextType,
  Time: TimeType,

  'semver-range': SemverRangeType,
  semver: SemverType,
};
