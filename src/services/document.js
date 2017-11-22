import _ from 'lodash'
import jsyaml from 'js-yaml'
import * as util from '../util'
import * as GitHubService from './github'
import * as NotificationService from './notifications'
import store from '../store'
import { actions } from '../actions'

const PENSIEVE_UUID_KEY = 'PS_UUID'

const getCleanJson = data => {
  // This function needs to correctly process the older key/value data structure
  const mappingFunction = _.isArray(data) ? _.map : _.mapValues

  let cleanJson = mappingFunction(data, value => {
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
  constructor (content, uuid = null) {
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
  }
}

const inflateSource = (source, contentPath) => {
  let json = jsyaml.load(source)

  if (contentPath) {
    json = _.get(json, contentPath)
  }

  const mapped = _.isArray(json)
    ? _.map(json, value => new Fragment(value))
    : _.mapValues(json, value => new Fragment(value))

  return mapped
}

export const updateAndCommitDocumentStructure = content => {
  const { config } = _.cloneDeep(store.getState())
  const cleaned = getCleanJson(content)
  const transformedDocumentData = _.map(cleaned, (value, key) =>
    _.assign({}, { title: key }, value)
  )

  // Fetch the yaml file from GitHub
  return GitHubService.getFile(config.repo)
    .then(source => {
      // Generate the source json
      const sourceJson = jsyaml.load(source)
      // set the merged content in the source json
      _.set(sourceJson, config.contentPath, transformedDocumentData)

      // Flip the source json back to yaml
      const newSource = jsyaml.safeDump(sourceJson)

      return newSource
    })
    .then(updatedYaml => {
      // Commit the merged source yaml
      return GitHubService.commit({
        content: updatedYaml,
        message: 'Update document to v2 structure'
      })
    })
    .then(() => {
      // Update the store with the new content
      store.dispatch(
        actions.setContent(
          transformedDocumentData.map(value => new Fragment(value))
        )
      )
    })
}

export const updateAndCommitFragment = (uuid, content, message) => {
  const { config } = _.cloneDeep(store.getState())
  let inflated

  // Fetch the yaml file from GitHub
  return GitHubService.getFile(config.repo)
    .then(source => {
      // Inflate the Yaml file into JSON data, then update the fragment with a matching UUID
      inflated = _.map(inflateSource(source, config.contentPath), value => {
        if (value.getUuid() === uuid) {
          return new Fragment(content, uuid)
        } else {
          return value
        }
      })

      // Generate the source json
      const sourceJson = jsyaml.load(source)

      // set the merged content in the source json
      _.set(sourceJson, config.contentPath, getCleanJson(inflated))

      // Flip the source json back to yaml
      const newSource = jsyaml.safeDump(sourceJson)

      return newSource
    })
    .then(updatedYaml => {
      // Commit the merged source yaml
      return GitHubService.commit({
        content: updatedYaml,
        message
      })
    })
    .then(() => {
      // Update the store with the new content
      store.dispatch(actions.setContent(inflated))
    })
}

export const deleteFragment = (uuid, message) => {
  const { config } = _.cloneDeep(store.getState())
  let inflated

  // Fetch the yaml file from GitHub
  return GitHubService.getFile(config.repo)
    .then(source => {
      // Inflate the Yaml file into JSON data
      inflated = inflateSource(source, config.contentPath)
      // Remove the fragment with a matching UUID
      inflated = inflated.filter(entry => {
        return entry.getUuid() !== uuid
      })

      // Generate the source json
      const sourceJson = jsyaml.load(source)

      // set the merged content in the source json
      _.set(sourceJson, config.contentPath, getCleanJson(inflated))

      // Flip the source json back to yaml
      const newSource = jsyaml.safeDump(sourceJson)

      return newSource
    })
    .then(updatedYaml => {
      // Commit the merged source yaml
      return GitHubService.commit({
        content: updatedYaml,
        message
      })
    })
    .then(() => {
      // Update the store with the new content
      store.dispatch(actions.setContent(inflated))
    })
}

/**
 * @description
 * Commit one or more new fragments to GitHub
 *
 * @param {*} data - A single entry object or an array of entry objects
 * @param {*} message - The commit message to send to GitHub
 */
export const commitFragment = (data, message) => {
  const { config } = _.cloneDeep(store.getState())
  let inflated

  // Fetch the yaml file from GitHub
  return GitHubService.getFile(config.repo)
    .then(source => {
      // Inflate the Yaml file into JSON data
      inflated = inflateSource(source, config.contentPath)

      // Merge our current data into the inflated file
      if (_.isArray(data)) {
        inflated = _.concat(data.map(d => new Fragment(d)), inflated)
      } else {
        inflated.unshift(new Fragment(data))
      }

      // Generate the source json
      const sourceJson = jsyaml.load(source)

      // set the merged content in the source json
      _.set(sourceJson, config.contentPath, getCleanJson(inflated))

      // Flip the source json back to yaml
      const newSource = jsyaml.safeDump(sourceJson)

      return newSource
    })
    .then(updatedYaml => {
      // Commit the merged source yaml
      return GitHubService.commit({
        content: updatedYaml,
        message
      })
    })
    .then(() => {
      // Update the store with the new content
      store.dispatch(actions.setContent(inflated))
    })
}

export const syncDocument = () => {
  const { config } = store.getState()
  util.debug('Syncing document')
  return Promise.all([
    GitHubService.loadSchema(config),
    GitHubService.getFile(config.repo)
  ]).then(([schema, source]) => {
    store.dispatch(
      actions.setContent(inflateSource(source, config.contentPath))
    )
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
