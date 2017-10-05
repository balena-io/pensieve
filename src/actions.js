export const TYPES = {
  LOGOUT: 'LOGOUT',
  SET_ALERTS: 'SET_ALERTS',
  SET_CONFIG: 'SET_CONFIG',
  SET_CONTENT: 'SET_CONTENT',
  SET_CREDENTIALS: 'SET_CREDENTIALS',
  SET_DOCUMENT_COMMIT: 'SET_DOCUMENT_COMMIT',
  SET_IS_EDITING_SCHEMA: 'SET_IS_EDITING_SCHEMA',
  SET_IS_LOGGED_IN: 'SET_IS_LOGGED_IN',
  SET_RULES: 'SET_RULES',
  SET_SCHEMA: 'SET_SCHEMA',
  SET_USER: 'SET_USER',
  SET_USER_IS_EDITING: 'SET_USER_IS_EDITING',
  SET_VIEWS: 'SET_VIEWS'
}

export const actions = {
  logout: () => ({ type: TYPES.LOGOUT }),
  setAlerts: value => ({ type: TYPES.SET_ALERTS, value }),
  setConfig: value => ({ type: TYPES.SET_CONFIG, value }),
  setContent: value => ({ type: TYPES.SET_CONTENT, value }),
  setCredentials: value => ({ type: TYPES.SET_CREDENTIALS, value }),
  setDocumentCommit: value => ({ type: TYPES.SET_DOCUMENT_COMMIT, value }),
  setIsEditingSchema: value => ({ type: TYPES.SET_IS_EDITING_SCHEMA, value }),
  setIsLoggedIn: value => ({ type: TYPES.SET_IS_LOGGED_IN, value }),
  setRules: value => ({ type: TYPES.SET_RULES, value }),
  setSchema: value => ({ type: TYPES.SET_SCHEMA, value }),
  setUser: value => ({ type: TYPES.SET_USER, value }),
  setUserIsEditing: value => ({ type: TYPES.SET_USER_IS_EDITING, value }),
  setViews: value => ({ type: TYPES.SET_VIEWS, value })
}
