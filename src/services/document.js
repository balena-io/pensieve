import _ from 'lodash'
import jsyaml from 'js-yaml'
import * as util from '../util'

window.jsyaml = jsyaml

let innerSource = null
let innerConfig = null
let innerJson = null

const PENSIEVE_UUID_KEY = 'PS_UUID'

class Fragment {
  constructor (title, content, uuid = null) {
    _.forEach(content, (value, key) => {
      if (key === PENSIEVE_UUID_KEY) {
        uuid = value
      } else {
        this[key] = value
      }
    })

    if (!uuid) {
      uuid = util.uuid()
    }

    this.getUuid = () => uuid
    this.getTitle = () => title
  }
}

export const setConfig = config => {
  innerConfig = config
}

export const setSource = source => {
  innerSource = source
}

export const getJSON = (ignoreCache = false) => {
  if (innerJson && !ignoreCache) {
    return innerJson
  }
  let json = jsyaml.load(innerSource)
  if (innerConfig.contentPath) {
    json = _.get(json, innerConfig.contentPath)
  }
  json = _.mapValues(json, (value, key) => new Fragment(key, value))

  innerJson = json

  return json
}

export const updateFragment = (uuid, title, content) => {
  innerJson = _.reduce(
    innerJson,
    (result, value, key) => {
      if (value.getUuid() === uuid) {
        result[title] = new Fragment(title, content, uuid)
      } else {
        result[key] = value
      }
      return result
    },
    {}
  )

  let cleanJson = _.mapValues(innerJson, value => {
    let picked = _.assign(
      _.pickBy(
        _.mapValues(value, x => (_.isDate(x) ? x.toString() : x)),
        _.negate(_.isFunction)
      ),
      { [PENSIEVE_UUID_KEY]: value.getUuid() }
    )
    return picked
  })

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource)
    _.set(sourceJson, innerConfig.contentPath, cleanJson)
    cleanJson = sourceJson
  }

  innerSource = jsyaml.safeDump(cleanJson)
}

export const deleteFragment = uuid => {
  innerJson = _.reduce(
    innerJson,
    (result, value, key) => {
      if (value.getUuid() !== uuid) {
        result[key] = value
      }
      return result
    },
    {}
  )

  let cleanJson = _.mapValues(innerJson, value =>
    _.pickBy(
      _.mapValues(value, x => (_.isDate(x) ? x.toString() : x)),
      _.negate(_.isFunction)
    )
  )

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource)
    _.set(sourceJson, innerConfig.contentPath, cleanJson)
    cleanJson = sourceJson
  }

  innerSource = jsyaml.safeDump(cleanJson)
}

export const addFragment = (title, content) => {
  const update = {}
  update[title] = new Fragment(title, content)
  _.assign(innerJson, update)

  let cleanJson = _.mapValues(innerJson, value =>
    _.pickBy(
      _.mapValues(value, x => (_.isDate(x) ? x.toString() : x)),
      _.negate(_.isFunction)
    )
  )

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource)
    _.set(sourceJson, innerConfig.contentPath, cleanJson)
    cleanJson = sourceJson
  }

  innerSource = jsyaml.safeDump(cleanJson)
}

export const getSource = () => innerSource
