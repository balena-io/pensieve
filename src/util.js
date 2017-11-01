import Promise from 'bluebird'
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
