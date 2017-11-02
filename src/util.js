import * as _ from 'lodash'
import Promise from 'bluebird'
import { oneLineCommaListsAnd } from 'common-tags'
import uuidv1 from 'uuid/v1'

const DEBUG = window.location.hostname === 'localhost'

export const debug = (...params) => {
  if (DEBUG) {
    console.log('DEBUG:', ...params)
  }
}

export const loadScript = url =>
  new Promise(resolve => {
    const scriptTag = document.createElement('script')
    scriptTag.src = url

    scriptTag.onload = resolve
    scriptTag.onreadystatechange = resolve

    document.body.appendChild(scriptTag)
  })

export const loadStyle = url =>
  new Promise(resolve => {
    const link = document.createElement('link')
    link.href = url
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.onload = resolve

    document.getElementsByTagName('head')[0].appendChild(link)
  })

export const randomString = (length = 16) => {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const uuid = uuidv1

export const makeAnchorLink = string => string.toLowerCase().replace(/\W/g, '-')

// Returns an array of fields where the value of 'modified' is different to the value of 'base'
export const diffObject = (base, modified) => {
  const changes = []
  _.forEach(base, (value, key) => {
    if (_(modified).has(key) && !_.isEqual(value, modified[key])) {
      changes.push(key)
    }
  })
  return changes
}

export const pluralize = (word, collection) =>
  `${word}${collection.length > 1 ? 's' : ''}`

export const commaWrapList = list => list.map(x => `"${x}"`)

export const objectDiffCommitMessage = (original, modified) => {
  let message = []
  const added = commaWrapList(_.difference(_.keys(modified), _.keys(original)))
  const removed = commaWrapList(
    _.difference(_.keys(original), _.keys(modified))
  )
  const changed = commaWrapList(diffObject(original, modified))
  if (added.length) {
    message.push(
      `adding ${pluralize('field', added)} ` +
        (added.length > 1 ? oneLineCommaListsAnd`${added}` : added[0])
    )
  }
  if (removed.length) {
    message.push(
      `removing ${pluralize('field', removed)} ` +
        (removed.length > 1 ? oneLineCommaListsAnd`${removed}` : removed[0])
    )
  }
  if (changed.length) {
    message.push(
      `changing ${pluralize('field', changed)} ` +
        (changed.length > 1 ? oneLineCommaListsAnd`${changed}` : changed[0])
    )
  }

  return message.join(', ')
}
