import _ from 'lodash'
import jsyaml from 'js-yaml'
import * as util from '../util'
import * as GitHubService from './github'
import * as NotificationService from './notifications'
import store from '../store'
import { actions } from '../actions'

window.jsyaml = jsyaml

let innerSource = null
let innerConfig = null
let innerJson = null

const PENSIEVE_UUID_KEY = 'PS_UUID'

const getCleanJson = () => {
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

  return cleanJson
}

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

  let cleanJson = getCleanJson()

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

  let cleanJson = getCleanJson()

  if (innerConfig.contentPath) {
    const sourceJson = jsyaml.load(innerSource)
    _.set(sourceJson, innerConfig.contentPath, cleanJson)
    cleanJson = sourceJson
  }

  innerSource = jsyaml.safeDump(cleanJson)
}

export const getSource = () => innerSource

export const syncDocument = () => {
  const { config } = store.getState()
  util.debug('Syncing document')
  return Promise.all([
    GitHubService.loadSchema(config),
    GitHubService.getFile(config.repo)
  ]).then(([schema, source]) => {
    setSource(source)
    store.dispatch(actions.setContent(getJSON(true)))
    store.dispatch(actions.setSchema(schema))
    let views = null

    return GitHubService.getFile(
      _.assign({}, config.repo, { file: 'views.yaml' })
    )
      .then(viewsYaml => {
        views = jsyaml.load(viewsYaml)
        store.dispatch(actions.setViews(views))
      })
      .catch(err => {
        NotificationService.error(err)
      })
  })
}
