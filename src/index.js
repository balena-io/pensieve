import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './app';

const Pensieve = (config) => {
  const mountElement = document.getElementById(config.container || 'pensieve');
  ReactDOM.render(
    <Provider store={store}>
      <App config={config} />
    </Provider>,
    mountElement,
  );
};

window.Pensieve = Pensieve;
