import { createStore } from 'redux';
import _ from 'lodash';

const PENSIEVE_STORAGE_KEY = 'pensieve_store';

const defaultState = () => ({
  isLoggedIn: false,
  isEditingSchema: false,
  views: {
    global: [],
    user: {},
  },
  rules: [],
});

const assign = (o1, o2) => _.assign({}, o1, o2);

const save = (store) => {
  localStorage.setItem(PENSIEVE_STORAGE_KEY, JSON.stringify(store));
};

const load = () => {
  const doc = localStorage.getItem(PENSIEVE_STORAGE_KEY);
  if (doc) {
    const data = JSON.parse(doc);
    data.isLoggedIn = false;
    return data;
  }

  return defaultState();
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SCHEMA':
      return assign(state, { schema: action.value });
    case 'SET_CONTENT':
      return assign(state, { content: _.cloneDeep(action.value) });
    case 'SET_CONFIG':
      return assign(state, { config: action.value });
    case 'SET_VIEWS':
      return assign(state, { views: action.value });
    case 'SET_RULES':
      return assign(state, { rules: _.cloneDeep(action.value) });
    case 'SET_IS_LOGGED_IN':
      return assign(state, { isLoggedIn: action.value });
    case 'SET_IS_EDITING_SCHEMA':
      return assign(state, { isEditingSchema: action.value });
    case 'SET_USER':
      return assign(state, { user: action.value });
    case 'LOGOUT':
      return defaultState();
    default:
      return state;
  }
};

const reducerWrapper = (state, action) => {
  if (!state) {
    state = load();
  }
  const newState = reducer(state, action);

  save(newState);

  return newState;
};

const store = createStore(reducerWrapper);

export default store;
