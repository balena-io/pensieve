import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import App from './app'

const Pensieve = config => {
  const mountElement = document.getElementById(config.container || 'pensieve')
  ReactDOM.render(
    <Provider store={store}>
      <App config={config} />
    </Provider>,
    mountElement
  )

  // Block unsafe inline scripts that might be injected in markdown
  var meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content =
    "script-src https://resin-production-downloads.s3.amazonaws.com/pensieve 'self';"
  document.getElementsByTagName('head')[0].appendChild(meta)
}

window.Pensieve = Pensieve
