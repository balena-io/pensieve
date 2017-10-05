import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { injectGlobal } from 'styled-components'
import { Provider } from 'rebass'
import { connect } from 'react-redux'
import _ from 'lodash'
import Alerts from './components/alerts'
import Header from './components/header'
import DocumentViewer from './components/document-viewer'
import Login from './components/login'
import { Container } from './components/shared'
import * as GitHubService from './services/github'
import * as DocumentService from './services/document'
import { actions } from './actions'
import { loadRulesFromUrl, updateUrl, searchExists } from './services/path'
import { debug } from './util'

/* eslint no-unused-expressions: 0 */
injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
  font-family: Roboto,Arial,sans-serif;
`

const DOCUMENT_POLL_INTERVAL = 3 * 1000

const theme = {
  font: 'Roboto,Arial,sans-serif',
  monospace: 'Ubuntu Mono Web,Courier New,monospace'
}

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true
    }

    this.props.setConfig(this.props.config)

    DocumentService.setConfig(this.props.config)

    GitHubService.ready.catch(err => {
      debug(err.message)
      this.setState({ loading: false })
    })

    setInterval(() => {
      if (!this.props.isLoggedIn) {
        return
      }

      GitHubService.getDocumentCommit(
        this.props.config.repo
      ).then(({ sha }) => {
        if (this.props.documentCommit && this.props.documentCommit !== sha) {
          debug('New commit detected', sha)
          this.setState({ syncing: true })
          DocumentService.syncDocument().then(() =>
            this.setState({ syncing: false })
          )
        }
        this.props.setDocumentCommit(sha)
      })
    }, DOCUMENT_POLL_INTERVAL)
  }

  componentWillReceiveProps ({ isLoggedIn }) {
    const previouslyLoggedIn = this.props.isLoggedIn

    if (isLoggedIn === previouslyLoggedIn) {
      return
    }

    if (!isLoggedIn) {
      return
    }

    this.setState({
      username: null,
      password: null,
      loading: true
    })

    DocumentService.syncDocument().then(() => {
      this.setState({
        loading: false
      })

      const { defaultView } = this.props.config

      // If a default view has been specified and there is no search query
      // in the url, load the default view.
      if (defaultView && !searchExists()) {
        if (_.isString(defaultView)) {
          // If the default view is a string, assume it is the name of a global view
          const view = _.find(this.props.views.global, { name: defaultView })
          if (view) {
            updateUrl(view.rules)
          }
        } else {
          // If the value is not a string, assume it is an array of filter views
          updateUrl(defaultView)
        }
      }

      this.props.setRules(loadRulesFromUrl(this.props.schema))
    })
  }

  render () {
    if (this.state.loading) {
      return (
        <Provider theme={theme}>
          <Header />

          <Container mt={30}>
            <FontAwesome spin name='cog' />
          </Container>
        </Provider>
      )
    }

    if (!this.props.isLoggedIn) {
      return (
        <Provider theme={theme}>
          <Header />

          <Login />
        </Provider>
      )
    }

    return (
      <Provider theme={theme}>
        <Header />

        <Container>
          <Alerts />
        </Container>

        <DocumentViewer />
        {this.state.syncing && (
          <div
            style={{
              position: 'fixed',
              left: 8,
              bottom: 8
            }}
          >
            <FontAwesome spin name='refresh' />
          </div>
        )}
      </Provider>
    )
  }
}

const mapStatetoProps = state => ({
  isLoggedIn: state.isLoggedIn,
  documentCommit: state.documentCommit,
  views: state.views,
  schema: state.schema
})

const mapDispatchToProps = dispatch => ({
  setBranchInfo: value => dispatch(actions.setBranchInfo(value)),
  setConfig: value => dispatch(actions.setConfig(value)),
  setSchema: value => dispatch(actions.setSchema(value)),
  setRules: value => dispatch(actions.setRules(value)),
  setContent: value => dispatch(actions.setContent(value)),
  setViews: value => dispatch(actions.setViews(value)),
  setDocumentCommit: value => dispatch(actions.setDocumentCommit(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(App)
