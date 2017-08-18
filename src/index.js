import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import store from './store';
import App from './app';
import registerServiceWorker from './registerServiceWorker';

const Pensieve = (config) => {
  const mountElement = document.getElementById(config.container || 'pensieve');
  ReactDOM.render(
    <Provider store={store}>
      <App config={config} />
    </Provider>,
    mountElement,
  );
  registerServiceWorker();
};

window.Pensieve = Pensieve;
