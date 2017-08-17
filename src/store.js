import { createStore } from 'redux';
import _ from 'lodash';

const assign = (o1, o2) => _.assign({}, o1, o2);

const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_SCHEMA':
      return assign(state, { schema: action.value });
    case 'SET_CONTENT':
      return assign(state, { content: action.value });
    case 'SET_CONFIG':
      return assign(state, { config: action.value });
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
