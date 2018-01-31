import React, { Component } from 'react'
import { Input, Box, Button, Heading } from 'resin-components'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import Alerts from '../alerts'
import { GreyDivider } from '../shared'
import * as GitHubService from '../../services/github'
import { actions } from '../../actions'
import * as NotificationService from '../../services/notifications'

class Login extends Component {
  constructor (props) {
    super(props)

    this.state = {
      username: '',
      password: '',
      token: '',
      loading: false,
      loginError: null,
      show2faForm: false
    }

    this.login = this.login.bind(this)
    this.loginToken = this.loginToken.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.toggle2faForm = this.toggle2faForm.bind(this)
  }

  toggle2faForm (show2faForm = true) {
    NotificationService.clear()
    this.setState({ show2faForm })
  }

  login (e) {
    if (e) {
      e.preventDefault()
    }

    const { username, password } = this.state
    if (!username || !password) {
      return
    }

    NotificationService.clear()

    GitHubService.login({ username, password })
      .then(() => {
        this.props.setIsLoggedIn(true)
      })
      .catch(err => {
        if (err.response.headers['x-github-otp']) {
          NotificationService.warning(
            'Oops! It looks like you have two factor authentication enabled on your account. Click the button below for information on how to login.'
          )
        } else {
          NotificationService.error('Incorrect username or password')
        }
      })
  }

  loginToken (e) {
    if (e) {
      e.preventDefault()
    }

    const { token } = this.state
    if (!token) {
      return
    }

    NotificationService.clear()

    GitHubService.login({ token })
      .then(() => {
        this.props.setIsLoggedIn(true)
      })
      .catch(err => {
        console.error(err)
        NotificationService.error('Incorrect API token')
      })
  }

  handleChange (e, attribute) {
    const update = {}
    update[attribute] = e.target.value
    this.setState(update)
  }

  render () {
    if (this.state.loading) {
      return <FontAwesome spin name='cog' />
    }
    if (this.state.show2faForm) {
      return (
        <Box mt={100} mr='auto' ml='auto' w={470}>
          <Heading.h2>Login to GitHub</Heading.h2>
          <Alerts />
          <Box>
            <p>
              If you have 2fa enabled on your github account, you will need to
              use a Personal API token to login to github.
            </p>
            <p>
              <a
                rel='noopener noreferrer'
                target='_blank'
                href='https://github.com/blog/1509-personal-api-tokens'
              >
                Click here
              </a>{' '}
              for more information about GitHub Personal API tokens.
            </p>
            <p>
              Pensieve needs to read files and metadata from the repository, and make
              commits on your behalf. Thus, the `repo` token scope is required,
              in full and not just parts of it.
            </p>
            <form onSubmit={this.loginToken}>
              <div>
                <Input
                  w='100%'
                  mb={3}
                  placeholder='Personal access token'
                  type='password'
                  value={this.state.token}
                  onChange={e => this.handleChange(e, 'token')}
                />
              </div>
              <Button primary>Login</Button>
            </form>
            <GreyDivider />
            <p>Do you want to login using your username and password?</p>
            <Button onClick={() => this.toggle2faForm(false)}>
              Click here
            </Button>
          </Box>
        </Box>
      )
    }
    return (
      <Box mt={100} mr='auto' ml='auto' w={470}>
        <Heading.h2 mb={3}>Login to GitHub</Heading.h2>
        <Alerts />
        <Box>
          <form onSubmit={this.login}>
            <div>
              <Input
                w='100%'
                mb={3}
                placeholder='username'
                value={this.state.username}
                onChange={e => this.handleChange(e, 'username')}
              />
            </div>
            <div>
              <Input
                w='100%'
                mb={3}
                placeholder='password'
                type='password'
                value={this.state.password}
                onChange={e => this.handleChange(e, 'password')}
              />
            </div>
            <Button primary>Login</Button>
          </form>
          <GreyDivider />
          <p>Do you use two factor authentication?</p>
          <Button onClick={this.toggle2faForm}>Click here</Button>
        </Box>
      </Box>
    )
  }
}

const mapStatetoProps = state => ({
  isLoggedIn: state.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
  setIsLoggedIn: () => dispatch(actions.setIsLoggedIn(true))
})

export default connect(mapStatetoProps, mapDispatchToProps)(Login)
