import { applyMiddleware, createStore } from 'redux'
import _ from 'lodash'
import { debug } from './util'
import { updateUrl } from './services/path'
import { TYPES } from './actions'

const PENSIEVE_STORAGE_KEY = 'pensieve_store'

const defaultState = () => ({
  isLoggedIn: false,
  isEditingSchema: false,
  views: {
    global: [],
    user: {}
  },
  rules: [],
  alerts: [],
  documentCommit: null,
  userIsEditing: false,
  content: {}
})

const assign = (o1, o2) => _.assign({}, o1, o2)

const save = store => {
  localStorage.setItem(PENSIEVE_STORAGE_KEY, JSON.stringify(store))
}

const load = () => {
  const doc = localStorage.getItem(PENSIEVE_STORAGE_KEY)
  if (doc) {
    const data = JSON.parse(doc)
    data.isLoggedIn = false
    data.documentCommit = null
    data.alerts = []
    data.userIsEditing = false
    data.content = {}
    return data
  }

  return defaultState()
}

const reducer = (state, action) => {
  switch (action.type) {
    case TYPES.LOGOUT:
      return defaultState()
    case TYPES.SET_ALERTS:
      return assign(state, { alerts: action.value.slice() })
    case TYPES.SET_BRANCH_INFO:
      return assign(state, { branchInfo: action.value })
    case TYPES.SET_CONFIG:
      return assign(state, { config: action.value })
    case TYPES.SET_CONTENT:
      return assign(state, { content: _.cloneDeep(action.value) })
    case TYPES.SET_CREDENTIALS:
      return assign(state, { credentials: action.value })
    case TYPES.SET_DOCUMENT_COMMIT:
      return assign(state, { documentCommit: action.value })
    case TYPES.SET_IS_EDITING_SCHEMA:
      return assign(state, { isEditingSchema: action.value })
    case TYPES.SET_IS_LOGGED_IN:
      return assign(state, { isLoggedIn: action.value })
    case TYPES.SET_RULES:
      return assign(state, { rules: _.cloneDeep(action.value) })
    case TYPES.SET_SCHEMA:
      return assign(state, { schema: action.value })
    case TYPES.SET_USER:
      return assign(state, { user: action.value })
    case TYPES.SET_USER_IS_EDITING:
      return assign(state, { userIsEditing: action.value })
    case TYPES.SET_VIEWS:
      return assign(state, { views: action.value })
    default:
      return state
  }
}

const reducerWrapper = (state, action) => {
  if (!state) {
    state = load()
  }
  const newState = reducer(state, action)

  save(newState)

  return newState
}

const logger = store => next => action => {
  debug('dispatching', _.cloneDeep(action))
  const result = next(action)
  debug('next state', store.getState())
  return result
}

const urlUpdater = store => next => action => {
  const result = next(action)
  if (action.type === 'SET_RULES') {
    const { rules } = store.getState()
    updateUrl(rules)
  }
  return result
}

export default createStore(reducerWrapper, applyMiddleware(logger, urlUpdater))
