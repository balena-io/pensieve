import { createStore } from 'redux';
import _ from 'lodash';

const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_SCHEMA':
      return _.assign(state, { schema: action.value });
    case 'SET_CONTENT':
      return _.assign(state, { content: action.value });
    case 'SET_CONFIG':
      return _.assign(state, { config: action.value });
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
