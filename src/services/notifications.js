import _ from 'lodash'
import store from '../store'
import { actions } from '../actions'
import { randomString } from '../util'

const ALERT_REMOVE_TIMEOUT = 10000
const ALERT_CHECK_INTERVAL = 1000

setInterval(() => {
  const { alerts } = store.getState()
  if (!alerts.length) {
    return
  }
  const now = Date.now()
  const filtered = alerts.filter(x => now - x.created < ALERT_REMOVE_TIMEOUT)

  if (filtered.length === alerts.length) {
    return
  }

  store.dispatch(actions.setAlerts(filtered))
}, ALERT_CHECK_INTERVAL)

const createNotification = (type, message) => {
  if (_.isObject(message) && message.message) {
    message = message.message
  }

  const { alerts } = store.getState()
  const alert = {
    type,
    message,
    id: randomString(),
    created: Date.now()
  }

  alerts.push(alert)

  store.dispatch(actions.setAlerts(alerts))
}

export const clear = () => {
  store.dispatch(actions.setAlerts([]))
}

export const dismiss = id => {
  const { alerts } = store.getState()

  store.dispatch(actions.setAlerts(alerts.filter(a => a.id !== id)))
}

export const error = message => {
  createNotification('error', message)
}

export const warning = message => {
  createNotification('warning', message)
}

export const success = message => {
  createNotification('success', message)
}

export const info = message => {
  createNotification('info', message)
}
