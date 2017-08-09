import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import registerServiceWorker from './registerServiceWorker';

const Pensieve = (config) => {
  const mountElement = document.getElementById(config.container || 'pensieve')
  ReactDOM.render(<App config={config} />, mountElement);
  registerServiceWorker();
};

window.Pensieve = Pensieve;
