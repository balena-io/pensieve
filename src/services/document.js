import _ from 'lodash'
import jsyaml from 'js-yaml'
import * as util from '../util'
import * as GitHubService from './github'
import * as NotificationService from './notifications'
import store from '../store'
import { actions } from '../actions'

const PENSIEVE_UUID_KEY = 'PS_UUID'

const getCleanJson = data => {
  let cleanJson = _.mapValues(data, value => {
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

const inflateSource = (source, contentPath) => {
  let json = jsyaml.load(source)

  if (contentPath) {
    json = _.get(json, contentPath)
  }

  const mapped = _.mapValues(json, (value, key) => new Fragment(key, value))

  return mapped
}

export const updateAndCommitFragment = (uuid, title, content, message) => {
  const { config } = _.cloneDeep(store.getState())
  let inflated

  // Fetch the yaml file from GitHub
  return GitHubService.getFile(config.repo)
    .then(source => {
      // Inflate the Yaml file into JSON data
      inflated = inflateSource(source, config.contentPath)
      // Update the fragment with a matching UUID
      inflated = _.reduce(
        inflated,
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
      inflated = _.reduce(
        inflated,
        (result, value, key) => {
          if (value.getUuid() !== uuid) {
            result[key] = value
          }
          return result
        },
        {}
      )

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

export const commitFragment = (title, data, message) => {
  const { config } = _.cloneDeep(store.getState())
  let inflated

  // Fetch the yaml file from GitHub
  return GitHubService.getFile(config.repo)
    .then(source => {
      // Inflate the Yaml file into JSON data
      inflated = inflateSource(source, config.contentPath)
      // Merge our current data into the inflated file
      inflated[title] = new Fragment(title, data)

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
