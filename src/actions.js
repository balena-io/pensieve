export const TYPES = {
  SET_SCHEMA: 'SET_SCHEMA',
  SET_CONTENT: 'SET_CONTENT',
  SET_CONFIG: 'SET_CONFIG',
  SET_VIEWS: 'SET_VIEWS',
  SET_RULES: 'SET_RULES',
  SET_IS_LOGGED_IN: 'SET_IS_LOGGED_IN',
  SET_IS_EDITING_SCHEMA: 'SET_IS_EDITING_SCHEMA',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
};

export const actions = {
  setConfig: value => ({ type: TYPES.SET_CONFIG, value }),
  setContent: value => ({ type: TYPES.SET_CONTENT, value }),
  setRules: value => ({ type: TYPES.SET_RULES, value }),
  setSchema: value => ({ type: TYPES.SET_SCHEMA, value }),
  setViews: value => ({ type: TYPES.SET_VIEWS, value }),
  setIsEditingSchema: value => ({ type: TYPES.SET_IS_EDITING_SCHEMA, value }),
  setIsLoggedIn: value => ({ type: TYPES.SET_IS_LOGGED_IN, value }),
  logout: () => ({ type: TYPES.LOGOUT }),
};
