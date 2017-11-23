import Promise from 'bluebird'
import yamlLint from 'yaml-lint'
import _ from 'lodash'
import { SchemaSieve } from 'resin-components'
import { PensieveLinterError, PensieveValidationError } from './errors'

const sieve = SchemaSieve()

export const lint = yaml =>
  Promise.resolve(
    yamlLint.lint(yaml).catch(e => {
      throw new PensieveLinterError(e)
    })
  )

export const schemaValidate = (schema, json) =>
  Promise.try(() => {
    _.forEach(schema, (value, key) => {
      if (!_(json).has(key)) {
        return
      }

      if (!sieve.validate(value.type, json[key])) {
        throw new PensieveValidationError(key, json[key], value.type)
      }
    })
  })
