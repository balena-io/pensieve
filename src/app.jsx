import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { injectGlobal } from 'styled-components'
import { Provider } from 'resin-components'
import { connect } from 'react-redux'
import _ from 'lodash'
import Alerts from './components/alerts'
import Header from './components/header'
import DocumentViewer from './components/document-viewer'
import Readme from './components/Readme'
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

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true
    }

    this.props.setConfig(this.props.config)

    GitHubService.ready.catch(err => {
      debug(err.message)
      this.setState({ loading: false })
    })
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

    DocumentService.syncDocument()
      .then(() => {
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
      // fetch branch information
      .then(() => GitHubService.getBranch(this.props.config.repo))
      .then(this.props.setBranchInfo)
      .then(() => {
        const { account, name, ref } = this.props.config.repo
        GitHubService.getFile({
          account,
          name,
          ref,
          file: 'README.md'
        }).then(this.props.setReadme)
      })
  }

  render () {
    if (this.state.loading) {
      return (
        <Provider>
          <Header />

          <Container mt={30}>
            <FontAwesome spin name='cog' />
          </Container>
        </Provider>
      )
    }

    if (!this.props.isLoggedIn) {
      return (
        <Provider>
          <Header />

          <Login />
        </Provider>
      )
    }

    return (
      <Provider>
        <Header />

        <Container>
          <Alerts />
        </Container>

        <Container>
          <Readme />
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
  setReadme: value => dispatch(actions.setReadme(value)),
  setRules: value => dispatch(actions.setRules(value)),
  setContent: value => dispatch(actions.setContent(value)),
  setViews: value => dispatch(actions.setViews(value)),
  setDocumentCommit: value => dispatch(actions.setDocumentCommit(value))
})

export default connect(mapStatetoProps, mapDispatchToProps)(App)
