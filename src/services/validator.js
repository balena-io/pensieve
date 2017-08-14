import Promise from 'bluebird';
import yamlLint from 'yaml-lint';
import { PensieveLinterError } from './errors';

export const lint = yaml =>
  Promise.resolve(
    yamlLint.lint(yaml).catch((e) => {
      throw new PensieveLinterError(e);
    }),
  );
