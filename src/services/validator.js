import Promise from 'bluebird';
import yamlLint from 'yaml-lint';
import jsyaml from 'js-yaml';
import _ from 'lodash';
import moment from 'moment';
import { PensieveLinterError, PensieveValidationError } from './errors';

export const lint = yaml =>
  Promise.resolve(
    yamlLint.lint(yaml).catch((e) => {
      throw new PensieveLinterError(e);
    }),
  );

export const schemaValidate = (schema, yaml) =>
  Promise.try(() => {
    const json = jsyaml.load(yaml);

    _.forEach(schema, (value, key) => {
      if (!_(json).has(key)) {
        return;
      }

      if (
        (value.type === 'string' && !_.isString(json[key])) ||
        (value.type === 'number' && !_.isNumber(json[key])) ||
        (value.type === 'boolean' && !_.isBoolean(json[key])) ||
        (value.type === 'date' && !moment(json[key]).isValid()) ||
        (value.type === 'semver-range' && !_.isString(json[key])) ||
        (value.type === 'semver' && !_.isString(json[key]))
      ) {
        throw new PensieveValidationError(key, json[key], value.type);
      }
    });
  });
