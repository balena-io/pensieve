import _ from 'lodash'
import { createBrowserHistory } from 'history'
import qs from 'qs'
import SchemaSieve from './filter'
import * as util from '../util'

const history = createBrowserHistory()

const sieve = SchemaSieve()

export const searchExists = () => !!history.location.search

export const loadRulesFromUrl = schema => {
  if (!history.location.search) {
    return []
  }
  const inputModels = sieve.makeFilterInputs(schema)
  const parsed = qs.parse(history.location.search.replace(/^\?/, ''))
  const rules = _.map(parsed, ({ n, o, v }) => {
    const rule = {
      name: n,
      operator: o,
      value: v
    }
    const baseRule = inputModels[rule.name]
    const newRule = _.assign(_.cloneDeep(baseRule), rule)
    newRule.id = util.randomString()
    return newRule
  })

  return rules
}

export const updateUrl = rules => {
  // Update url query string
  const { pathname } = history.location

  history.push({
    pathname,
    search: qs.stringify(
      rules.map(({ name, operator, value }) => ({
        n: name,
        o: operator,
        v: value
      }))
    )
  })
}
