import * as BooleanType from './boolean';
import * as CaseInsensitiveTextType from './case-insensitive-text';
import * as DateTimeType from './date-time';
import * as DateType from './date';
import * as IntegerType from './integer';
import * as RealType from './real';
import * as ShortTextType from './short-text';
import * as TextType from './text';
import * as TimeType from './time';

import * as SemverRangeType from './semver-range';
import * as SemverType from './semver';

export default {
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
