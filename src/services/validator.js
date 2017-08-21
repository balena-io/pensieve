import Promise from 'bluebird';
import yamlLint from 'yaml-lint';
import jsyaml from 'js-yaml';
import _ from 'lodash';
import SchemaSieve from './filter';
import { PensieveLinterError, PensieveValidationError } from './errors';

const sieve = SchemaSieve();

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

      if (!sieve.validate(value.type, json[key])) {
        throw new PensieveValidationError(key, json[key], value.type);
      }
    });
  });
